from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.database.database import get_db
from app.database.models import Semester, Subject, Category, Document
from app.repositories.crud import get_semester_or_404, get_subject_or_404, get_category_or_404
from app.schemas.semester import SemesterResponse, SemesterCreate
from app.schemas.subject import SubjectResponse, SubjectCreate
from app.schemas.category import CategoryResponse, CategoryCreate
from app.schemas.filter import FiltersResponse

router = APIRouter()


@router.get("/all", response_model=FiltersResponse)
async def get_all_filters(db: AsyncSession = Depends(get_db)) -> FiltersResponse:
    semesters = (await db.execute(select(Semester))).scalars().all()
    subjects = (await db.execute(select(Subject).options(selectinload(Subject.semester)))).scalars().all()
    categories = (await db.execute(select(Category))).scalars().all()
    return {"semesters": semesters, "subjects": subjects, "categories": categories}


@router.get("/semesters", response_model=list[SemesterResponse])
async def list_semesters(db: AsyncSession = Depends(get_db)) -> list[SemesterResponse]:
    result = await db.execute(select(Semester))
    return result.scalars().all()


@router.post("/semesters", response_model=SemesterResponse)
async def create_semester(semester: SemesterCreate, db: AsyncSession = Depends(get_db)) -> SemesterResponse:
    existing = (await db.execute(select(Semester).filter(Semester.name == semester.name))).scalars().first()
    if existing:
        raise HTTPException(status_code=400, detail="Semester already exists")

    db_semester = Semester(name=semester.name)
    db.add(db_semester)
    await db.commit()
    await db.refresh(db_semester)
    return db_semester


@router.get("/subjects", response_model=list[SubjectResponse])
async def list_subjects(semester_id: int | None = None, db: AsyncSession = Depends(get_db)) -> list[SubjectResponse]:
    query = select(Subject).options(selectinload(Subject.semester))
    if semester_id is not None:
        query = query.filter(Subject.semester_id == semester_id)
    result = await db.execute(query)
    return result.scalars().all()


@router.post("/subjects", response_model=SubjectResponse)
async def create_subject(subject: SubjectCreate, db: AsyncSession = Depends(get_db)) -> SubjectResponse:
    await get_semester_or_404(db, subject.semester_id)

    db_subject = Subject(name=subject.name, semester_id=subject.semester_id)
    db.add(db_subject)
    await db.commit()
    await db.refresh(db_subject)
    return db_subject


@router.get("/categories", response_model=list[CategoryResponse])
async def list_categories(db: AsyncSession = Depends(get_db)) -> list[CategoryResponse]:
    result = await db.execute(select(Category))
    return result.scalars().all()


@router.post("/categories", response_model=CategoryResponse)
async def create_category(category: CategoryCreate, db: AsyncSession = Depends(get_db)) -> CategoryResponse:
    existing = (await db.execute(select(Category).filter(Category.name == category.name))).scalars().first()
    if existing:
        raise HTTPException(status_code=400, detail="Category already exists")

    db_category = Category(name=category.name)
    db.add(db_category)
    await db.commit()
    await db.refresh(db_category)
    return db_category


@router.delete("/semesters/{semester_id}")
async def delete_semester(semester_id: int, db: AsyncSession = Depends(get_db)) -> dict[str, str]:
    semester = await get_semester_or_404(db, semester_id)

    has_subjects = (await db.execute(select(Subject).filter(Subject.semester_id == semester_id))).scalars().first()
    if has_subjects:
        raise HTTPException(status_code=400, detail="Cannot delete semester with existing subjects")

    await db.delete(semester)
    await db.commit()
    return {"message": "Semester deleted"}


@router.delete("/subjects/{subject_id}")
async def delete_subject(subject_id: int, db: AsyncSession = Depends(get_db)) -> dict[str, str]:
    subject = await get_subject_or_404(db, subject_id)

    has_documents = (await db.execute(select(Document).filter(Document.subject_id == subject_id))).scalars().first()
    if has_documents:
        raise HTTPException(status_code=400, detail="Cannot delete subject with existing documents")

    await db.delete(subject)
    await db.commit()
    return {"message": "Subject deleted"}


@router.delete("/categories/{category_id}")
async def delete_category(category_id: int, db: AsyncSession = Depends(get_db)) -> dict[str, str]:
    category = await get_category_or_404(db, category_id)

    has_documents = (await db.execute(select(Document).filter(Document.category_id == category_id))).scalars().first()
    if has_documents:
        raise HTTPException(status_code=400, detail="Cannot delete category with existing documents")

    await db.delete(category)
    await db.commit()
    return {"message": "Category deleted"}
