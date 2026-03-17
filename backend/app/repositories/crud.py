from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.database.models import Category, Document, Semester, Subject


def get_or_404(db: Session, model: type, id: int):
    obj = db.query(model).filter(model.id == id).first()
    if not obj:
        raise HTTPException(status_code=404, detail=f"{model.__name__} not found")
    return obj


def get_category_or_404(db: Session, category_id: int) -> Category:
    return get_or_404(db, Category, category_id)


def get_subject_or_404(db: Session, subject_id: int) -> Subject:
    return get_or_404(db, Subject, subject_id)


def get_semester_or_404(db: Session, semester_id: int) -> Semester:
    return get_or_404(db, Semester, semester_id)


def get_document_or_404(db: Session, document_id: int) -> Document:
    return get_or_404(db, Document, document_id)
