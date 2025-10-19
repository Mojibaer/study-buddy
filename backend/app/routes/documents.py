from fastapi import APIRouter, UploadFile, File, Form, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
import os
import shutil
from datetime import datetime
import uuid

from app.database import get_db
from app.models import Document
from app.schemas import DocumentResponse
from app.services.document_service import extract_text_from_file
from app.services.chroma_service import chroma_service

router = APIRouter()

UPLOAD_DIR = "./uploads"

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
    # Validate file extension
    allowed_extensions = {".pdf", ".docx", ".txt", ".md"}
    file_ext = os.path.splitext(file.filename)[1].lower()

    if file_ext not in allowed_extensions:
        raise HTTPException(
            status_code=400,
            detail=f"File type {file_ext} not supported. Allowed: {allowed_extensions}"
        )

    unique_filename = f"{uuid.uuid4()}{file_ext}"
    file_path = os.path.join(UPLOAD_DIR, unique_filename)

    # Save file
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    file_size = os.path.getsize(file_path)

    # Extract text for ChromaDB
    extracted_text = extract_text_from_file(file_path, file_ext)

    tag_list = [tag.strip() for tag in tags.split(",")] if tags else []

    # Save in DB (Postgres)
    db_document = Document(
        filename=unique_filename,
        original_filename=file.filename,
        file_path=file_path,
        file_type=file_ext,
        file_size=file_size,
        category=category,
        subject=subject,
        semester=semester,
        tags=tag_list,
        extracted_text=extracted_text
    )

    db.add(db_document)
    db.commit()
    db.refresh(db_document)

    # Add it to ChromaDB(if text exist)
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