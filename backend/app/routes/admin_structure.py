from collections import defaultdict

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.dependencies import require_admin
from app.database.database import get_db
from app.database.models import Category, Document, Semester, Subject, User
from app.repositories.crud import (
    get_category_or_404,
    get_semester_or_404,
    get_subject_or_404,
)
from app.schemas.category import CategoryCreate, CategoryResponse
from app.schemas.semester import SemesterCreate, SemesterResponse
from app.schemas.structure import (
    CategoryAdminResponse,
    CategoryUpdate,
    SemesterAdminResponse,
    SemesterUpdate,
    StructureOverview,
    SubjectAdminResponse,
    SubjectUpdate,
)
from app.schemas.subject import SubjectCreate, SubjectResponse

router = APIRouter()


async def _document_counts_by_subject(db: AsyncSession) -> dict[int, int]:
    result = await db.execute(
        select(Document.subject_id, func.count(Document.id)).group_by(Document.subject_id)
    )
    return {subject_id: count for subject_id, count in result.all()}


async def _document_counts_by_category(db: AsyncSession) -> dict[int, int]:
    result = await db.execute(
        select(Document.category_id, func.count(Document.id)).group_by(Document.category_id)
    )
    return {category_id: count for category_id, count in result.all()}


@router.get("/overview", response_model=StructureOverview)
async def overview(
    db: AsyncSession = Depends(get_db),
    _admin: User = Depends(require_admin),
) -> StructureOverview:
    semesters = (await db.execute(select(Semester).order_by(Semester.name))).scalars().all()
    subjects = (
        await db.execute(
            select(Subject)
            .options(selectinload(Subject.semester))
            .order_by(Subject.name)
        )
    ).scalars().all()
    categories = (await db.execute(select(Category).order_by(Category.name))).scalars().all()

    subject_counts = await _document_counts_by_subject(db)
    category_counts = await _document_counts_by_category(db)

    subjects_by_semester: dict[int, int] = defaultdict(int)
    documents_by_semester: dict[int, int] = defaultdict(int)
    for subject in subjects:
        subjects_by_semester[subject.semester_id] += 1
        documents_by_semester[subject.semester_id] += subject_counts.get(subject.id, 0)

    return StructureOverview(
        semesters=[
            SemesterAdminResponse(
                id=s.id,
                name=s.name,
                subject_count=subjects_by_semester.get(s.id, 0),
                document_count=documents_by_semester.get(s.id, 0),
            )
            for s in semesters
        ],
        subjects=[
            SubjectAdminResponse(
                id=s.id,
                name=s.name,
                semester_id=s.semester_id,
                semester=s.semester,
                document_count=subject_counts.get(s.id, 0),
            )
            for s in subjects
        ],
        categories=[
            CategoryAdminResponse(
                id=c.id,
                name=c.name,
                document_count=category_counts.get(c.id, 0),
            )
            for c in categories
        ],
    )


@router.post("/semesters", response_model=SemesterResponse, status_code=status.HTTP_201_CREATED)
async def create_semester(
    body: SemesterCreate,
    db: AsyncSession = Depends(get_db),
    _admin: User = Depends(require_admin),
) -> Semester:
    name = body.name.strip()
    existing = (await db.execute(select(Semester).where(Semester.name == name))).scalar_one_or_none()
    if existing is not None:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Semester already exists")

    semester = Semester(name=name)
    db.add(semester)
    await db.commit()
    await db.refresh(semester)
    return semester


@router.patch("/semesters/{semester_id}", response_model=SemesterResponse)
async def rename_semester(
    semester_id: int,
    body: SemesterUpdate,
    db: AsyncSession = Depends(get_db),
    _admin: User = Depends(require_admin),
) -> Semester:
    semester = await get_semester_or_404(db, semester_id)
    name = body.name.strip()

    if name != semester.name:
        clash = (
            await db.execute(select(Semester).where(Semester.name == name, Semester.id != semester_id))
        ).scalar_one_or_none()
        if clash is not None:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Semester already exists")
        semester.name = name
        await db.commit()
        await db.refresh(semester)

    return semester


@router.delete("/semesters/{semester_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_semester(
    semester_id: int,
    force: bool = Query(default=False),
    db: AsyncSession = Depends(get_db),
    _admin: User = Depends(require_admin),
) -> None:
    semester = await get_semester_or_404(db, semester_id)

    subject_count = (
        await db.execute(
            select(func.count()).select_from(Subject).where(Subject.semester_id == semester_id)
        )
    ).scalar_one()

    if subject_count > 0 and not force:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail={"reason": "has_subjects", "subject_count": subject_count},
        )

    await db.delete(semester)
    try:
        await db.commit()
    except IntegrityError as exc:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Cannot delete semester: documents still reference its subjects",
        ) from exc


@router.post("/subjects", response_model=SubjectResponse, status_code=status.HTTP_201_CREATED)
async def create_subject(
    body: SubjectCreate,
    db: AsyncSession = Depends(get_db),
    _admin: User = Depends(require_admin),
) -> Subject:
    await get_semester_or_404(db, body.semester_id)
    name = body.name.strip()

    clash = (
        await db.execute(
            select(Subject).where(Subject.semester_id == body.semester_id, Subject.name == name)
        )
    ).scalar_one_or_none()
    if clash is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Subject with this name already exists in the semester",
        )

    subject = Subject(name=name, semester_id=body.semester_id)
    db.add(subject)
    await db.commit()
    return await _load_subject(db, subject.id)


@router.patch("/subjects/{subject_id}", response_model=SubjectResponse)
async def update_subject(
    subject_id: int,
    body: SubjectUpdate,
    db: AsyncSession = Depends(get_db),
    _admin: User = Depends(require_admin),
) -> Subject:
    subject = await get_subject_or_404(db, subject_id)

    if body.semester_id is not None and body.semester_id != subject.semester_id:
        await get_semester_or_404(db, body.semester_id)
        subject.semester_id = body.semester_id

    if body.name is not None:
        subject.name = body.name.strip()

    clash = (
        await db.execute(
            select(Subject).where(
                Subject.semester_id == subject.semester_id,
                Subject.name == subject.name,
                Subject.id != subject.id,
            )
        )
    ).scalar_one_or_none()
    if clash is not None:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Subject with this name already exists in the semester",
        )

    await db.commit()
    return await _load_subject(db, subject.id)


@router.delete("/subjects/{subject_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_subject(
    subject_id: int,
    db: AsyncSession = Depends(get_db),
    _admin: User = Depends(require_admin),
) -> None:
    subject = await get_subject_or_404(db, subject_id)

    document_count = (
        await db.execute(
            select(func.count()).select_from(Document).where(Document.subject_id == subject_id)
        )
    ).scalar_one()

    if document_count > 0:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail={"reason": "has_documents", "document_count": document_count},
        )

    await db.delete(subject)
    await db.commit()


@router.post("/categories", response_model=CategoryResponse, status_code=status.HTTP_201_CREATED)
async def create_category(
    body: CategoryCreate,
    db: AsyncSession = Depends(get_db),
    _admin: User = Depends(require_admin),
) -> Category:
    name = body.name.strip()
    existing = (await db.execute(select(Category).where(Category.name == name))).scalar_one_or_none()
    if existing is not None:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Category already exists")

    category = Category(name=name)
    db.add(category)
    await db.commit()
    await db.refresh(category)
    return category


@router.patch("/categories/{category_id}", response_model=CategoryResponse)
async def rename_category(
    category_id: int,
    body: CategoryUpdate,
    db: AsyncSession = Depends(get_db),
    _admin: User = Depends(require_admin),
) -> Category:
    category = await get_category_or_404(db, category_id)
    name = body.name.strip()

    if name != category.name:
        clash = (
            await db.execute(select(Category).where(Category.name == name, Category.id != category_id))
        ).scalar_one_or_none()
        if clash is not None:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Category already exists")
        category.name = name
        await db.commit()
        await db.refresh(category)

    return category


@router.delete("/categories/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_category(
    category_id: int,
    db: AsyncSession = Depends(get_db),
    _admin: User = Depends(require_admin),
) -> None:
    category = await get_category_or_404(db, category_id)

    document_count = (
        await db.execute(
            select(func.count()).select_from(Document).where(Document.category_id == category_id)
        )
    ).scalar_one()

    if document_count > 0:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail={"reason": "has_documents", "document_count": document_count},
        )

    await db.delete(category)
    await db.commit()


async def _load_subject(db: AsyncSession, subject_id: int) -> Subject:
    result = await db.execute(
        select(Subject).options(selectinload(Subject.semester)).where(Subject.id == subject_id)
    )
    return result.scalar_one()