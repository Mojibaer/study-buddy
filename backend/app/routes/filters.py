from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.database.database import get_db
from app.database import Semester, Subject, Category, Document
from app.repositories.crud import get_semester_or_404, get_subject_or_404, get_category_or_404
from app.database.schemas import (
    SemesterResponse, SemesterCreate,
    SubjectResponse, SubjectCreate,
    CategoryResponse, CategoryCreate,
    FiltersResponse
)

router = APIRouter()


# Combined filters endpoint
@router.get("/all", response_model=FiltersResponse)
def get_all_filters(db: Session = Depends(get_db)):
    """
    Get all filter options (semesters, subjects, categories)
    """
    return {
        "semesters": db.query(Semester).all(),
        "subjects": db.query(Subject).all(),
        "categories": db.query(Category).all()
    }

@router.get("/semesters", response_model=List[SemesterResponse])
def list_semesters(db: Session = Depends(get_db)):
    return db.query(Semester).all()


@router.post("/semesters", response_model=SemesterResponse)
def create_semester(semester: SemesterCreate, db: Session = Depends(get_db)):
    existing = db.query(Semester).filter(Semester.name == semester.name).first()
    if existing:
        raise HTTPException(status_code=400, detail="Semester already exists")

    db_semester = Semester(name=semester.name)
    db.add(db_semester)
    db.commit()
    db.refresh(db_semester)
    return db_semester


# Subjects
@router.get("/subjects", response_model=List[SubjectResponse])
def list_subjects(semester_id: int = None, db: Session = Depends(get_db)):
    query = db.query(Subject)
    if semester_id:
        query = query.filter(Subject.semester_id == semester_id)
    return query.all()


@router.post("/subjects", response_model=SubjectResponse)
def create_subject(subject: SubjectCreate, db: Session = Depends(get_db)):
    # Validate semester exists
    semester = db.query(Semester).filter(Semester.id == subject.semester_id).first()
    if not semester:
        raise HTTPException(status_code=400, detail="Semester not found")

    db_subject = Subject(name=subject.name, semester_id=subject.semester_id)
    db.add(db_subject)
    db.commit()
    db.refresh(db_subject)
    return db_subject

@router.get("/categories", response_model=List[CategoryResponse])
def list_categories(db: Session = Depends(get_db)):
    return db.query(Category).all()


@router.post("/categories", response_model=CategoryResponse)
def create_category(category: CategoryCreate, db: Session = Depends(get_db)):
    existing = db.query(Category).filter(Category.name == category.name).first()
    if existing:
        raise HTTPException(status_code=400, detail="Category already exists")

    db_category = Category(name=category.name)
    db.add(db_category)
    db.commit()
    db.refresh(db_category)
    return db_category

@router.delete("/semesters/{semester_id}")
def delete_semester(semester_id: int, db: Session = Depends(get_db)):
    semester = get_semester_or_404(db, semester_id)

    if db.query(Subject).filter(Subject.semester_id == semester_id).first():
        raise HTTPException(status_code=400, detail="Cannot delete semester with existing subjects")

    db.delete(semester)
    db.commit()
    return {"message": "Semester deleted"}


@router.delete("/subjects/{subject_id}")
def delete_subject(subject_id: int, db: Session = Depends(get_db)):
    subject = get_subject_or_404(db, subject_id)

    if db.query(Document).filter(Document.subject_id == subject_id).first():
        raise HTTPException(status_code=400, detail="Cannot delete subject with existing documents")

    db.delete(subject)
    db.commit()
    return {"message": "Subject deleted"}

@router.delete("/categories/{category_id}")
def delete_category(category_id: int, db: Session = Depends(get_db)):
    category = get_category_or_404(db, category_id)

    if db.query(Document).filter(Document.category_id == category_id).first():
        raise HTTPException(status_code=400, detail="Cannot delete category with existing documents")

    db.delete(category)
    db.commit()
    return {"message": "Category deleted"}