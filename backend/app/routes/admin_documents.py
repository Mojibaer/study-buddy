import asyncio
import logging

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import or_, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.dependencies import (
    get_embedding_provider,
    get_weaviate,
    require_admin,
)
from app.database.database import get_db
from app.database.models import Document, Subject, User
from app.repositories.crud import (
    get_category_or_404,
    get_document_or_404,
    get_subject_or_404,
)
from app.schemas.document import (
    DocumentAdminResponse,
    DocumentAdminUpdate,
    DocumentBulkDeleteRequest,
    DocumentBulkDeleteResponse,
)
from app.services.embedding import EmbeddingProvider
from app.services.minio_service import delete_file
from app.services.weaviate_service import WeaviateService

logger = logging.getLogger(__name__)

router = APIRouter()


def _parse_tags(raw: str | None) -> list[str]:
    if not raw:
        return []
    return [tag.strip() for tag in raw.split(",") if tag.strip()]


def _serialize_tags(tags: list[str]) -> str | None:
    cleaned = [tag.strip() for tag in tags if tag.strip()]
    if not cleaned:
        return None
    return ",".join(cleaned)


def _to_admin_response(document: Document) -> DocumentAdminResponse:
    return DocumentAdminResponse.model_validate({
        "id": document.id,
        "filename": document.filename,
        "original_filename": document.original_filename,
        "file_type": document.file_type,
        "file_size": document.file_size,
        "file_url": document.file_url,
        "subject_id": document.subject_id,
        "category_id": document.category_id,
        "subject": document.subject,
        "category": document.category,
        "uploaded_by": document.uploaded_by,
        "uploader": document.uploaded_by_user,
        "tags": _parse_tags(document.tags),
        "vectorized_at": document.vectorized_at,
        "indexed_in_weaviate": document.vectorized_at is not None,
        "created_at": document.created_at,
        "updated_at": document.updated_at,
    })


def _document_query():
    return select(Document).options(
        selectinload(Document.subject).selectinload(Subject.semester),
        selectinload(Document.category),
        selectinload(Document.uploaded_by_user),
    )


async def _load_document(db: AsyncSession, document_id: int) -> Document:
    result = await db.execute(_document_query().where(Document.id == document_id))
    document = result.scalar_one_or_none()
    if document is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found")
    return document


@router.get("", response_model=list[DocumentAdminResponse])
async def list_documents(
    semester_id: int | None = Query(default=None),
    subject_id: int | None = Query(default=None),
    category_id: int | None = Query(default=None),
    uploader_id: int | None = Query(default=None),
    orphaned: bool | None = Query(default=None),
    indexed: bool | None = Query(default=None),
    search: str | None = Query(default=None, min_length=1, max_length=200),
    limit: int = Query(default=200, ge=1, le=500),
    db: AsyncSession = Depends(get_db),
    _admin: User = Depends(require_admin),
) -> list[DocumentAdminResponse]:
    query = _document_query().order_by(Document.created_at.desc()).limit(limit)

    if subject_id is not None:
        query = query.where(Document.subject_id == subject_id)
    if category_id is not None:
        query = query.where(Document.category_id == category_id)
    if semester_id is not None:
        query = query.join(Subject, Document.subject_id == Subject.id).where(
            Subject.semester_id == semester_id
        )
    if uploader_id is not None:
        query = query.where(Document.uploaded_by == uploader_id)
    if orphaned is True:
        query = query.where(Document.uploaded_by.is_(None))
    elif orphaned is False:
        query = query.where(Document.uploaded_by.is_not(None))
    if indexed is True:
        query = query.where(Document.vectorized_at.is_not(None))
    elif indexed is False:
        query = query.where(Document.vectorized_at.is_(None))
    if search:
        pattern = f"%{search.lower()}%"
        query = query.where(
            or_(
                Document.original_filename.ilike(pattern),
                Document.tags.ilike(pattern),
            )
        )

    result = await db.execute(query)
    return [_to_admin_response(doc) for doc in result.scalars().all()]


@router.get("/{document_id}", response_model=DocumentAdminResponse)
async def get_document(
    document_id: int,
    db: AsyncSession = Depends(get_db),
    _admin: User = Depends(require_admin),
) -> DocumentAdminResponse:
    document = await _load_document(db, document_id)
    return _to_admin_response(document)


@router.patch("/{document_id}", response_model=DocumentAdminResponse)
async def update_document(
    document_id: int,
    body: DocumentAdminUpdate,
    db: AsyncSession = Depends(get_db),
    _admin: User = Depends(require_admin),
) -> DocumentAdminResponse:
    document = await _load_document(db, document_id)

    if body.subject_id is not None and body.subject_id != document.subject_id:
        await get_subject_or_404(db, body.subject_id)
        document.subject_id = body.subject_id

    if body.category_id is not None and body.category_id != document.category_id:
        await get_category_or_404(db, body.category_id)
        document.category_id = body.category_id

    if body.tags is not None:
        document.tags = _serialize_tags(body.tags)

    await db.commit()
    refreshed = await _load_document(db, document_id)
    return _to_admin_response(refreshed)


@router.delete("/{document_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_document(
    document_id: int,
    db: AsyncSession = Depends(get_db),
    _admin: User = Depends(require_admin),
    provider: EmbeddingProvider = Depends(get_embedding_provider),
    weaviate: WeaviateService = Depends(get_weaviate),
) -> None:
    document = await get_document_or_404(db, document_id)
    await _delete_artifacts(document, provider, weaviate)
    await db.delete(document)
    await db.commit()


@router.post("/bulk-delete", response_model=DocumentBulkDeleteResponse)
async def bulk_delete_documents(
    body: DocumentBulkDeleteRequest,
    db: AsyncSession = Depends(get_db),
    _admin: User = Depends(require_admin),
    provider: EmbeddingProvider = Depends(get_embedding_provider),
    weaviate: WeaviateService = Depends(get_weaviate),
) -> DocumentBulkDeleteResponse:
    if not body.ids:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No document ids provided")

    result = await db.execute(select(Document).where(Document.id.in_(body.ids)))
    found = result.scalars().all()
    found_ids = {doc.id for doc in found}

    for document in found:
        await _delete_artifacts(document, provider, weaviate)
        await db.delete(document)
    await db.commit()

    return DocumentBulkDeleteResponse(
        deleted=sorted(found_ids),
        not_found=sorted(set(body.ids) - found_ids),
    )


async def _delete_artifacts(
    document: Document,
    provider: EmbeddingProvider,
    weaviate: WeaviateService,
) -> None:
    try:
        delete_file(document.filename)
    except Exception:
        logger.exception("Failed to delete file for document %d; continuing", document.id)
    if document.vectorized_at is not None:
        try:
            await asyncio.to_thread(weaviate.delete_document, provider.name, document.id)
        except Exception:
            logger.exception(
                "Failed to delete Weaviate vector for document %d; continuing",
                document.id,
            )