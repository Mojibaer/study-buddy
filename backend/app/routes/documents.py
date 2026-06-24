import asyncio
import logging
import os
from datetime import datetime, timezone

import magic
import math

from fastapi import APIRouter, UploadFile, File, Form, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.dependencies import (
    get_current_active_user,
    get_embedding_provider,
    get_weaviate,
)
from app.database.database import get_db
from app.database.models import Document, Subject, User, UserRole
from app.schemas.document import (
    BulkUploadItemResult,
    BulkUploadResponse,
    DocumentResponse,
)
from app.repositories.crud import get_category_or_404, get_document_or_404, get_subject_or_404
from app.core.config import settings
from app.services.document_service import extract_text_from_bytes
from app.services.embedding import EmbeddingProvider
from app.services.embedding.base import EmbeddingRateLimitError
from app.services.minio_service import upload_file, get_presigned_url, delete_file, get_file_url
from app.services.plagiarism_service import find_similar_above_threshold
from app.services.weaviate_service import WeaviateService

logger = logging.getLogger(__name__)

router = APIRouter()

ALLOWED_MIME_TYPES = {
    ".pdf": "application/pdf",
    ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ".txt": "text/plain",
    ".md": "text/plain",
}
ALLOWED_EXTENSIONS = set(ALLOWED_MIME_TYPES.keys())
MAX_UPLOAD_BYTES = 50 * 1024 * 1024  # 50 MB

EMBED_TEXT_MAX_CHARS = 8000
SNIPPET_MAX_CHARS = 500

MAX_BULK_FILES = 20


async def _validate_and_read(file: UploadFile) -> tuple[str, bytes, int]:
    """Validate a single upload's extension, size and MIME type, returning
    (file_ext, file_content, file_size). Raises HTTPException on any failure."""
    file_ext = os.path.splitext(file.filename)[1].lower()
    if file_ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"File type {file_ext} not supported. Allowed: {ALLOWED_EXTENSIONS}",
        )

    file_content = await file.read(MAX_UPLOAD_BYTES + 1)
    if len(file_content) > MAX_UPLOAD_BYTES:
        raise HTTPException(status_code=413, detail="File too large. Maximum allowed size is 50 MB.")

    detected_mime = magic.Magic(mime=True).from_buffer(file_content)
    if detected_mime != ALLOWED_MIME_TYPES[file_ext]:
        raise HTTPException(
            status_code=400,
            detail=f"File content does not match extension '{file_ext}'.",
        )
    return file_ext, file_content, len(file_content)


def _build_searchable(extracted_text: str, subject_name: str) -> tuple[str, str]:
    """Return (embed_input, snippet) for the extracted text, both truncated."""
    searchable_text = extracted_text
    if subject_name:
        searchable_text += f" Fach: {subject_name}"
    return searchable_text[:EMBED_TEXT_MAX_CHARS], searchable_text[:SNIPPET_MAX_CHARS]


async def _persist_document(
    db: AsyncSession,
    weaviate: WeaviateService,
    provider_name: str,
    *,
    file: UploadFile,
    file_ext: str,
    file_content: bytes,
    file_size: int,
    category_id: int | None,
    subject_id: int | None,
    uploaded_by: int,
    embed_vector: list[float] | None,
    snippet: str,
) -> Document:
    """Upload to MinIO, persist the Postgres row, then index in Weaviate.
    Cleans up the MinIO object if the Postgres commit fails. A Weaviate failure
    is non-fatal — the row stays with vectorized_at NULL for later reindex."""
    object_key = upload_file(
        file_data=file_content,
        original_filename=file.filename,
        content_type=file.content_type or "application/octet-stream",
    )

    db_document = Document(
        filename=object_key,
        original_filename=file.filename,
        file_type=file_ext,
        file_size=file_size,
        file_url=get_file_url(object_key),
        category_id=category_id,
        subject_id=subject_id,
        uploaded_by=uploaded_by,
    )

    db.add(db_document)
    try:
        await db.commit()
    except Exception:
        try:
            delete_file(object_key)
        except Exception:
            logger.exception("Failed to clean up MinIO object %s after Postgres commit error", object_key)
        raise

    # Eager-load relationships once. selectinload avoids the lazy-load that would
    # otherwise fail with MissingGreenlet when the response is serialized.
    db_document = await _load_document_with_relations(db, db_document.id)

    if embed_vector is not None:
        try:
            await asyncio.to_thread(
                weaviate.insert_document,
                provider_name,
                db_document.id,
                snippet,
                embed_vector,
            )
            db_document.vectorized_at = datetime.now(timezone.utc)
            await db.commit()
            db_document = await _load_document_with_relations(db, db_document.id)
        except Exception:
            logger.exception(
                "Failed to vectorize document %d; leaving vectorized_at NULL for reindex",
                db_document.id,
            )

    return db_document


@router.post("/upload", response_model=DocumentResponse)
async def upload_document(
    file: UploadFile = File(...),
    category_id: int | None = Form(None),
    subject_id: int | None = Form(None),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
    provider: EmbeddingProvider = Depends(get_embedding_provider),
    weaviate: WeaviateService = Depends(get_weaviate),
) -> DocumentResponse:
    file_ext, file_content, file_size = await _validate_and_read(file)

    if category_id is not None:
        await get_category_or_404(db, category_id)

    subject_name = ""
    if subject_id is not None:
        subject = await get_subject_or_404(db, subject_id)
        subject_name = subject.name

    # Extract + embed BEFORE persisting so the plagiarism check can block the
    # upload without leaving an orphaned MinIO object or Postgres row behind.
    extracted_text = extract_text_from_bytes(file_content, file_ext)

    embed_vector: list[float] | None = None
    snippet = ""
    if extracted_text:
        embed_input, snippet = _build_searchable(extracted_text, subject_name)
        try:
            embed_vector = await asyncio.to_thread(provider.embed, embed_input)
        except EmbeddingRateLimitError:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail={
                    "code": "rate_limited",
                    "message": "Embedding service is rate limited. Please try again in a moment.",
                },
            )

        match = await find_similar_above_threshold(
            db, provider, weaviate, embed_vector, settings.PLAGIARISM_THRESHOLD
        )
        if match is not None:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail={
                    "code": "plagiarism_detected",
                    "message": "This document is too similar to one that already exists.",
                    "similar_document": match.as_detail(),
                },
            )

    return await _persist_document(
        db, weaviate, provider.name,
        file=file,
        file_ext=file_ext,
        file_content=file_content,
        file_size=file_size,
        category_id=category_id,
        subject_id=subject_id,
        uploaded_by=current_user.id,
        embed_vector=embed_vector,
        snippet=snippet,
    )


def _cosine_similarity(a: list[float], b: list[float]) -> float:
    dot = sum(x * y for x, y in zip(a, b))
    norm_a = math.sqrt(sum(x * x for x in a))
    norm_b = math.sqrt(sum(y * y for y in b))
    if norm_a == 0 or norm_b == 0:
        return 0.0
    return dot / (norm_a * norm_b)


@router.post("/upload/bulk", response_model=BulkUploadResponse)
async def upload_documents_bulk(
    files: list[UploadFile] = File(...),
    category_id: int | None = Form(None),
    subject_id: int | None = Form(None),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
    provider: EmbeddingProvider = Depends(get_embedding_provider),
    weaviate: WeaviateService = Depends(get_weaviate),
) -> BulkUploadResponse:
    """Upload several documents in one request, embedding them all with a single
    provider call (embed_many) so a batch costs one rate-limit unit, not N.

    Per-file failures (bad type, plagiarism, rate limit) are isolated: a failing
    file is reported in its result and the rest still upload. Plagiarism is
    checked against existing documents AND against earlier files in the same
    batch, so two near-identical files in one upload don't both slip through."""
    if not files:
        raise HTTPException(status_code=400, detail="No files provided.")
    if len(files) > MAX_BULK_FILES:
        raise HTTPException(
            status_code=400,
            detail=f"Too many files. Maximum {MAX_BULK_FILES} per bulk upload.",
        )

    # Category/subject are shared across the batch — validate once up front.
    if category_id is not None:
        await get_category_or_404(db, category_id)
    subject_name = ""
    if subject_id is not None:
        subject = await get_subject_or_404(db, subject_id)
        subject_name = subject.name

    # Stage 1: validate + read every file. Failures are recorded per-file, not
    # raised, so one bad file doesn't sink the batch. `prepared` holds the files
    # that passed and still need embedding/persisting, indexed by position.
    results: list[BulkUploadItemResult | None] = [None] * len(files)
    prepared: list[dict] = []
    for idx, file in enumerate(files):
        try:
            file_ext, file_content, file_size = await _validate_and_read(file)
        except HTTPException as exc:
            results[idx] = BulkUploadItemResult(
                filename=file.filename, status="error", message=str(exc.detail)
            )
            continue

        extracted_text = extract_text_from_bytes(file_content, file_ext)
        embed_input, snippet = ("", "")
        if extracted_text:
            embed_input, snippet = _build_searchable(extracted_text, subject_name)
        prepared.append({
            "idx": idx,
            "file": file,
            "file_ext": file_ext,
            "file_content": file_content,
            "file_size": file_size,
            "embed_input": embed_input,
            "snippet": snippet,
        })

    # Stage 2: one embed_many call for every file that has text. Files without
    # extractable text get a None vector and skip the plagiarism check.
    to_embed = [p for p in prepared if p["embed_input"]]
    if to_embed:
        try:
            vectors = await asyncio.to_thread(
                provider.embed_many, [p["embed_input"] for p in to_embed]
            )
        except EmbeddingRateLimitError:
            # The single batch call was throttled — nothing got embedded. Mark
            # every still-pending file as rate_limited so the client can retry.
            for p in prepared:
                results[p["idx"]] = BulkUploadItemResult(
                    filename=p["file"].filename,
                    status="rate_limited",
                    message="Embedding service is rate limited. Please try again in a moment.",
                )
            return _finalize_bulk(results)
        for p, vec in zip(to_embed, vectors):
            p["embed_vector"] = vec
    for p in prepared:
        p.setdefault("embed_vector", None)

    # Stage 3: persist each file in order, checking plagiarism against existing
    # documents and against vectors already accepted earlier in this batch.
    accepted_vectors: list[list[float]] = []
    for p in prepared:
        idx = p["idx"]
        embed_vector = p["embed_vector"]

        if embed_vector is not None:
            match = await find_similar_above_threshold(
                db, provider, weaviate, embed_vector, settings.PLAGIARISM_THRESHOLD
            )
            if match is not None:
                results[idx] = BulkUploadItemResult(
                    filename=p["file"].filename,
                    status="plagiarism",
                    similar_document=match.as_detail(),
                    message="This document is too similar to one that already exists.",
                )
                continue

            intra = next(
                (v for v in accepted_vectors
                 if _cosine_similarity(embed_vector, v) >= settings.PLAGIARISM_THRESHOLD),
                None,
            )
            if intra is not None:
                results[idx] = BulkUploadItemResult(
                    filename=p["file"].filename,
                    status="plagiarism",
                    message="This document is too similar to another file in the same upload.",
                )
                continue

        try:
            db_document = await _persist_document(
                db, weaviate, provider.name,
                file=p["file"],
                file_ext=p["file_ext"],
                file_content=p["file_content"],
                file_size=p["file_size"],
                category_id=category_id,
                subject_id=subject_id,
                uploaded_by=current_user.id,
                embed_vector=embed_vector,
                snippet=p["snippet"],
            )
        except Exception:
            logger.exception("Bulk upload failed to persist %s", p["file"].filename)
            results[idx] = BulkUploadItemResult(
                filename=p["file"].filename, status="error", message="Failed to store document."
            )
            continue

        if embed_vector is not None:
            accepted_vectors.append(embed_vector)
        results[idx] = BulkUploadItemResult(
            filename=p["file"].filename,
            status="uploaded",
            document=DocumentResponse.model_validate(db_document),
        )

    return _finalize_bulk(results)


def _finalize_bulk(results: list[BulkUploadItemResult | None]) -> BulkUploadResponse:
    final = [r for r in results if r is not None]
    uploaded = sum(1 for r in final if r.status == "uploaded")
    return BulkUploadResponse(results=final, uploaded=uploaded, failed=len(final) - uploaded)


def _with_presigned_url(document: Document) -> Document:
    """Replace the stored (raw, private-bucket) file_url with a fresh presigned
    URL so the frontend can actually fetch the object (preview/inline view).
    Signed per-request, so it never expires from the consumer's perspective.
    The DB column keeps the raw URL; only the response is rewritten."""
    if document is not None and document.filename:
        document.file_url = get_presigned_url(document.filename)
    return document


async def _load_document_with_relations(db: AsyncSession, document_id: int) -> Document:
    result = await db.execute(
        select(Document)
        .options(
            selectinload(Document.category),
            selectinload(Document.subject).selectinload(Subject.semester),
        )
        .filter(Document.id == document_id)
    )
    return _with_presigned_url(result.scalars().first())


@router.get("/", response_model=list[DocumentResponse])
async def list_documents(
    category_id: int | None = None,
    subject_id: int | None = None,
    semester_id: int | None = None,
    db: AsyncSession = Depends(get_db),
    _current_user: User = Depends(get_current_active_user),
) -> list[DocumentResponse]:
    query = select(Document).options(
        selectinload(Document.category),
        selectinload(Document.subject).selectinload(Subject.semester)
    )

    if category_id is not None:
        query = query.filter(Document.category_id == category_id)
    if subject_id is not None:
        query = query.filter(Document.subject_id == subject_id)
    if semester_id is not None:
        query = query.join(Subject).filter(Subject.semester_id == semester_id)

    result = await db.execute(query)
    return [_with_presigned_url(doc) for doc in result.scalars().all()]


@router.get("/{document_id}", response_model=DocumentResponse)
async def get_document(
    document_id: int,
    db: AsyncSession = Depends(get_db),
    _current_user: User = Depends(get_current_active_user),
) -> DocumentResponse:
    # 404 first, then re-load with relations eager-loaded so serializing
    # DocumentResponse (subject/category) doesn't trigger a lazy-load -> MissingGreenlet.
    await get_document_or_404(db, document_id)
    return await _load_document_with_relations(db, document_id)


@router.get("/{document_id}/download")
async def get_download_url(
    document_id: int,
    db: AsyncSession = Depends(get_db),
    _current_user: User = Depends(get_current_active_user),
) -> dict[str, str]:
    document = await get_document_or_404(db, document_id)
    url = get_presigned_url(document.filename)
    return {"url": url, "filename": document.original_filename}


@router.delete("/{document_id}")
async def delete_document(
    document_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
    provider: EmbeddingProvider = Depends(get_embedding_provider),
    weaviate: WeaviateService = Depends(get_weaviate),
) -> dict[str, str]:
    document = await get_document_or_404(db, document_id)

    # Only the uploader or an admin can delete. uploaded_by may be NULL for
    # documents whose uploader was deleted (SET NULL on user delete) — those
    # are admin-only by design.
    is_owner = document.uploaded_by is not None and document.uploaded_by == current_user.id
    is_admin = current_user.role == UserRole.admin
    if not (is_owner or is_admin):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not allowed to delete this document",
        )

    delete_file(document.filename)

    try:
        await asyncio.to_thread(
            weaviate.delete_document, provider.name, document.id
        )
    except Exception:
        logger.exception(
            "Failed to delete Weaviate vector for document %d; continuing",
            document.id,
        )

    await db.delete(document)
    await db.commit()

    return {"message": "Document deleted"}
