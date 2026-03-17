from fastapi import APIRouter, UploadFile, File, Form, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
import os

from app.database.database import get_db
from app.database.models import Document
from app.database.schemas import DocumentResponse
from app.repositories.crud import get_category_or_404, get_document_or_404, get_subject_or_404
from app.services.document_service import extract_text_from_bytes
from app.services.chroma_service import chroma_service
from app.services.minio_service import upload_file, get_presigned_url, delete_file, get_file_url

router = APIRouter()


@router.post("/upload", response_model=DocumentResponse)
async def upload_document(
    file: UploadFile = File(...),
    category_id: Optional[int] = Form(None),
    subject_id: Optional[int] = Form(None),
    tags: Optional[str] = Form(None),
    db: Session = Depends(get_db)
):
    """
    Upload a document with metadata
    """
    allowed_extensions = {".pdf", ".docx", ".txt", ".md"}
    file_ext = os.path.splitext(file.filename)[1].lower()

    if file_ext not in allowed_extensions:
        raise HTTPException(
            status_code=400,
            detail=f"File type {file_ext} not supported. Allowed: {allowed_extensions}"
        )

    # Validate foreign keys
    if category_id:
        get_category_or_404(db, category_id)

    if subject_id:
        get_subject_or_404(db, subject_id)

    file_content = await file.read()
    file_size = len(file_content)

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
        tags=tag_list
    )

    db.add(db_document)
    db.commit()
    db.refresh(db_document)

    # Add to ChromaDB
    if extracted_text:
        # Get names for ChromaDB Metadata
        category_name = db_document.category.name if db_document.category else ""
        subject_name = db_document.subject.name if db_document.subject else ""
        semester_name = db_document.subject.semester.name if db_document.subject else ""

        # Enrich text with metadata for better semantic search
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
        db.commit()

    return db_document


@router.get("/", response_model=List[DocumentResponse])
def list_documents(
    category_id: Optional[int] = None,
    subject_id: Optional[int] = None,
    semester_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    """
    List all documents with optional filters
    """
    query = db.query(Document)

    if category_id:
        query = query.filter(Document.category_id == category_id)
    if subject_id:
        query = query.filter(Document.subject_id == subject_id)
    if semester_id:
        query = query.join(Subject).filter(Subject.semester_id == semester_id)

    return query.all()


@router.get("/{document_id}", response_model=DocumentResponse)
def get_document(document_id: int, db: Session = Depends(get_db)):
    """
    Get a specific document
    """
    return get_document_or_404(db, document_id)


@router.get("/{document_id}/download")
def get_download_url(document_id: int, db: Session = Depends(get_db)):
    """
    Get a temporary download URL for a document
    """
    document = get_document_or_404(db, document_id)

    url = get_presigned_url(document.filename)
    return {"url": url, "filename": document.original_filename}


@router.delete("/{document_id}")
def delete_document(document_id: int, db: Session = Depends(get_db)):
    """
    Delete a document from MinIO and database
    """
    document = get_document_or_404(db, document_id)

    delete_file(document.filename)

    if document.chroma_id:
        chroma_service.delete_document(document.chroma_id)

    db.delete(document)
    db.commit()

    return {"message": "Document deleted"}