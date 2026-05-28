from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.dependencies import get_current_active_user
from app.database.database import get_db
from app.database.models import Semester, Subject, Category, User
from app.schemas.semester import SemesterResponse
from app.schemas.subject import SubjectResponse
from app.schemas.category import CategoryResponse
from app.schemas.filter import FiltersResponse

# Read-only filter data for any authenticated user (dropdowns on search/browse).
# Mutations live in app/routes/admin_structure.py under /admin/structure (admin-only).
router = APIRouter()


@router.get("/all", response_model=FiltersResponse)
async def get_all_filters(
    db: AsyncSession = Depends(get_db),
    _current_user: User = Depends(get_current_active_user),
) -> FiltersResponse:
    semesters = (await db.execute(select(Semester))).scalars().all()
    subjects = (await db.execute(select(Subject).options(selectinload(Subject.semester)))).scalars().all()
    categories = (await db.execute(select(Category))).scalars().all()
    return {"semesters": semesters, "subjects": subjects, "categories": categories}


@router.get("/semesters", response_model=list[SemesterResponse])
async def list_semesters(
    db: AsyncSession = Depends(get_db),
    _current_user: User = Depends(get_current_active_user),
) -> list[SemesterResponse]:
    result = await db.execute(select(Semester))
    return result.scalars().all()


@router.get("/subjects", response_model=list[SubjectResponse])
async def list_subjects(
    semester_id: int | None = None,
    db: AsyncSession = Depends(get_db),
    _current_user: User = Depends(get_current_active_user),
) -> list[SubjectResponse]:
    query = select(Subject).options(selectinload(Subject.semester))
    if semester_id is not None:
        query = query.filter(Subject.semester_id == semester_id)
    result = await db.execute(query)
    return result.scalars().all()


@router.get("/categories", response_model=list[CategoryResponse])
async def list_categories(
    db: AsyncSession = Depends(get_db),
    _current_user: User = Depends(get_current_active_user),
) -> list[CategoryResponse]:
    result = await db.execute(select(Category))
    return result.scalars().all()
