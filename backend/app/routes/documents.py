import os

import magic
from fastapi import APIRouter, UploadFile, File, Form, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.database.database import get_db
from app.database.models import Document, Subject
from app.schemas.document import DocumentResponse
from app.repositories.crud import get_category_or_404, get_document_or_404, get_subject_or_404
from app.services.document_service import extract_text_from_bytes
from app.services.chroma_service import chroma_service
from app.services.minio_service import upload_file, get_presigned_url, delete_file, get_file_url

router = APIRouter()


@router.post("/upload", response_model=DocumentResponse)
async def upload_document(
    file: UploadFile = File(...),
    category_id: int | None = Form(None),
    subject_id: int | None = Form(None),
    tags: str | None = Form(None),
    db: AsyncSession = Depends(get_db)
) -> DocumentResponse:
    ALLOWED_EXTENSIONS = {".pdf", ".docx", ".txt", ".md"}
    ALLOWED_MIME_TYPES = {
        ".pdf": "application/pdf",
        ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ".txt": "text/plain",
        ".md": "text/plain",
    }

    file_ext = os.path.splitext(file.filename)[1].lower()

    if file_ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"File type {file_ext} not supported. Allowed: {ALLOWED_EXTENSIONS}"
        )

    if category_id is not None:
        await get_category_or_404(db, category_id)

    if subject_id is not None:
        await get_subject_or_404(db, subject_id)

    MAX_UPLOAD_BYTES = 50 * 1024 * 1024  # 50 MB
    file_content = await file.read(MAX_UPLOAD_BYTES + 1)
    if len(file_content) > MAX_UPLOAD_BYTES:
        raise HTTPException(status_code=413, detail="File too large. Maximum allowed size is 50 MB.")
    file_size = len(file_content)

    detected_mime = magic.Magic(mime=True).from_buffer(file_content)
    if detected_mime != ALLOWED_MIME_TYPES[file_ext]:
        raise HTTPException(
            status_code=400,
            detail=f"File content does not match extension '{file_ext}'."
        )

    object_key = upload_file(
        file_data=file_content,
        original_filename=file.filename,
        content_type=file.content_type or "application/octet-stream"
    )

    extracted_text = extract_text_from_bytes(file_content, file_ext)
    tag_list = [tag.strip() for tag in tags.split(",")] if tags else []

    db_document = Document(
        filename=object_key,
        original_filename=file.filename,
        file_type=file_ext,
        file_size=file_size,
        file_url=get_file_url(object_key),
        category_id=category_id,
        subject_id=subject_id,
    )

    db.add(db_document)
    await db.commit()
    await db.refresh(db_document)

    if extracted_text:
        result = await db.execute(
            select(Document)
            .options(
                selectinload(Document.category),
                selectinload(Document.subject).selectinload(Subject.semester)
            )
            .filter(Document.id == db_document.id)
        )
        db_document = result.scalars().first()

        category_name = db_document.category.name if db_document.category else ""
        subject_name = db_document.subject.name if db_document.subject else ""
        semester_name = db_document.subject.semester.name if db_document.subject else ""

        searchable_text = extracted_text
        if subject_name:
            searchable_text += f" Fach: {subject_name}"
        if tag_list:
            searchable_text += f" Tags: {' '.join(tag_list)}"

        chroma_id = f"doc_{db_document.id}"
        chroma_service.add_document(
            doc_id=chroma_id,
            text=searchable_text,
            metadata={
                "document_id": db_document.id,
                "filename": file.filename,
                "category": category_name,
                "subject": subject_name,
                "semester": semester_name,
                "tags": ",".join(tag_list)
            }
        )
        db_document.chroma_id = chroma_id
        await db.commit()
        await db.refresh(db_document)

    return db_document


@router.get("/", response_model=list[DocumentResponse])
async def list_documents(
    category_id: int | None = None,
    subject_id: int | None = None,
    semester_id: int | None = None,
    db: AsyncSession = Depends(get_db)
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
    return result.scalars().all()


@router.get("/{document_id}", response_model=DocumentResponse)
async def get_document(document_id: int, db: AsyncSession = Depends(get_db)) -> DocumentResponse:
    return await get_document_or_404(db, document_id)


@router.get("/{document_id}/download")
async def get_download_url(document_id: int, db: AsyncSession = Depends(get_db)) -> dict[str, str]:
    document = await get_document_or_404(db, document_id)
    url = get_presigned_url(document.filename)
    return {"url": url, "filename": document.original_filename}


@router.delete("/{document_id}")
async def delete_document(document_id: int, db: AsyncSession = Depends(get_db)) -> dict[str, str]:
    document = await get_document_or_404(db, document_id)

    delete_file(document.filename)

    if document.chroma_id:
        chroma_service.delete_document(document.chroma_id)

    await db.delete(document)
    await db.commit()

    return {"message": "Document deleted"}
