"""Admin analytics aggregation. HTTP-free; routes translate HTTP to these calls."""
import asyncio
from datetime import date, timedelta

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.models import Document, Semester, Subject, User
from app.schemas.analytics import (
    AnalyticsOverview,
    SubjectCoverage,
    UploadActivityPoint,
)
from app.services import minio_service

UPLOAD_ACTIVITY_DAYS = 30


async def _total_documents(db: AsyncSession) -> int:
    return await db.scalar(select(func.count(Document.id))) or 0


async def _total_users(db: AsyncSession) -> int:
    return await db.scalar(select(func.count(User.id))) or 0


async def _upload_activity(db: AsyncSession) -> list[UploadActivityPoint]:
    """Daily upload counts for the last 30 days, including days with zero uploads."""
    start = date.today() - timedelta(days=UPLOAD_ACTIVITY_DAYS - 1)
    upload_day = func.date(Document.created_at)

    result = await db.execute(
        select(upload_day, func.count(Document.id))
        .where(upload_day >= start)
        .group_by(upload_day)
    )
    counts = dict(result.all())

    activity = []
    for offset in range(UPLOAD_ACTIVITY_DAYS):
        day = start + timedelta(days=offset)
        activity.append(UploadActivityPoint(date=day.isoformat(), count=counts.get(day, 0)))
    return activity


async def _subject_coverage(db: AsyncSession) -> list[SubjectCoverage]:
    """Document count per subject, zero-document subjects included and listed first."""
    document_count = func.count(Document.id)
    result = await db.execute(
        select(Subject.id, Subject.name, Semester.name, document_count)
        .join(Semester, Subject.semester_id == Semester.id)
        .outerjoin(Document, Document.subject_id == Subject.id)
        .group_by(Subject.id, Subject.name, Semester.name)
        .order_by(document_count.asc(), Semester.name, Subject.name)
    )
    return [
        SubjectCoverage(
            subject_id=subject_id,
            subject_name=subject_name,
            semester_name=semester_name,
            document_count=count,
        )
        for subject_id, subject_name, semester_name, count in result.all()
    ]


async def get_overview(db: AsyncSession) -> AnalyticsOverview:
    return AnalyticsOverview(
        total_documents=await _total_documents(db),
        total_users=await _total_users(db),
        total_storage_bytes=await asyncio.to_thread(minio_service.get_bucket_size),
        upload_activity=await _upload_activity(db),
        subject_coverage=await _subject_coverage(db),
    )
