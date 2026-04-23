from typing import TypeVar

from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.models import Category, Document, Semester, Subject

T = TypeVar("T")


async def get_or_404(db: AsyncSession, model: type[T], id: int) -> T:
    result = await db.execute(select(model).filter(model.id == id))
    obj = result.scalars().first()
    if not obj:
        raise HTTPException(status_code=404, detail=f"{model.__name__} not found")
    return obj


async def get_category_or_404(db: AsyncSession, category_id: int) -> Category:
    return await get_or_404(db, Category, category_id)


async def get_subject_or_404(db: AsyncSession, subject_id: int) -> Subject:
    return await get_or_404(db, Subject, subject_id)


async def get_semester_or_404(db: AsyncSession, semester_id: int) -> Semester:
    return await get_or_404(db, Semester, semester_id)


async def get_document_or_404(db: AsyncSession, document_id: int) -> Document:
    return await get_or_404(db, Document, document_id)
