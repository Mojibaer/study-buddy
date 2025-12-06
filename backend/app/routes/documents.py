from fastapi import APIRouter, UploadFile, File, Form, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
import os
from datetime import datetime
import uuid

from app.database.database import get_db
from app.database.models import Document
from app.database.schemas import DocumentResponse
from app.services.document_service import extract_text_from_bytes
from app.services.chroma_service import chroma_service
from app.services.minio_service import upload_file, get_presigned_url, delete_file, get_file_url

router = APIRouter()


@router.post("/upload", response_model=DocumentResponse)
async def upload_document(
    file: UploadFile = File(...),
    category: Optional[str] = Form(None),
    subject: Optional[str] = Form(None),
    semester: Optional[str] = Form(None),
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

    file_content = await file.read()
    file_size = len(file_content)

    # Upload to MinIO
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
        category=category,
        subject=subject,
        semester=semester,
        tags=tag_list,
        extracted_text=extracted_text
    )

    db.add(db_document)
    db.commit()
    db.refresh(db_document)

    # Add to ChromaDB (if text exists)
    if extracted_text:
        chroma_id = f"doc_{db_document.id}"
        chroma_service.add_document(
            doc_id=chroma_id,
            text=extracted_text,
            metadata={
                "document_id": db_document.id,
                "filename": file.filename,
                "category": category or "uncategorized",
                "subject": subject or "",
                "semester": semester or "",
                "tags": ",".join(tag_list)
            }
        )
        db_document.chroma_id = chroma_id
        db.commit()

    return db_document


@router.get("/", response_model=List[DocumentResponse])
def list_documents(
    category: Optional[str] = None,
    subject: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    List all documents with optional filters
    """
    query = db.query(Document)

    if category:
        query = query.filter(Document.category == category)
    if subject:
        query = query.filter(Document.subject == subject)

    return query.all()


@router.get("/{document_id}", response_model=DocumentResponse)
def get_document(document_id: int, db: Session = Depends(get_db)):
    """
    Get a specific document
    """
    document = db.query(Document).filter(Document.id == document_id).first()
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
    return document


@router.get("/{document_id}/download")
def get_download_url(document_id: int, db: Session = Depends(get_db)):
    """
    Get a temporary download URL for a document
    """
    document = db.query(Document).filter(Document.id == document_id).first()
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")

    url = get_presigned_url(document.file_path)
    return {"url": url, "filename": document.original_filename}


@router.delete("/{document_id}")
def delete_document(document_id: int, db: Session = Depends(get_db)):
    """
    Delete a document from MinIO and database
    """
    document = db.query(Document).filter(Document.id == document_id).first()
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")

    delete_file(document.file_path)

    if document.chroma_id:
        chroma_service.delete_document(document.chroma_id)

    db.delete(document)
    db.commit()

    return {"message": "Document deleted"}