import asyncio
from datetime import datetime, timedelta, timezone

from sqlalchemy import func, select, text
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.redis import redis_client
from app.database.models import Document, User
from app.schemas.system import (
    DocumentSync,
    ServiceStatus,
    StuckAccount,
    SystemHealth,
)
from app.services import minio_service
from app.services.embedding import EmbeddingProvider
from app.services.weaviate_service import WeaviateService

STUCK_ACCOUNT_AGE = timedelta(hours=24)
STUCK_ACCOUNT_LIMIT = 100


def _up(name: str) -> ServiceStatus:
    return ServiceStatus(name=name, status="up")


def _down(name: str, error: Exception) -> ServiceStatus:
    return ServiceStatus(name=name, status="down", detail=str(error))


async def _check_postgres(db: AsyncSession) -> ServiceStatus:
    try:
        await db.execute(text("SELECT 1"))
        return _up("postgres")
    except Exception as e:
        return _down("postgres", e)


async def _check_redis() -> ServiceStatus:
    try:
        await redis_client.ping()
        return _up("redis")
    except Exception as e:
        return _down("redis", e)


async def _check_weaviate(weaviate: WeaviateService) -> ServiceStatus:
    try:
        ready = await asyncio.to_thread(lambda: weaviate.client.is_ready())
        return _up("weaviate") if ready else ServiceStatus(name="weaviate", status="down")
    except Exception as e:
        return _down("weaviate", e)


async def _check_minio() -> ServiceStatus:
    try:
        await asyncio.to_thread(minio_service.health_check)
        return _up("minio")
    except Exception as e:
        return _down("minio", e)


async def _document_sync(
    db: AsyncSession, weaviate: WeaviateService, provider: EmbeddingProvider
) -> DocumentSync:
    postgres_documents = await db.scalar(select(func.count(Document.id))) or 0
    unindexed = await db.scalar(
        select(func.count(Document.id)).where(Document.vectorized_at.is_(None))
    ) or 0

    try:
        weaviate_documents = await asyncio.to_thread(weaviate.count, provider.name)
    except Exception:
        weaviate_documents = None

    in_sync = (
        weaviate_documents is not None
        and unindexed == 0
        and postgres_documents == weaviate_documents
    )

    return DocumentSync(
        postgres_documents=postgres_documents,
        weaviate_documents=weaviate_documents,
        unindexed_documents=unindexed,
        in_sync=in_sync,
    )


async def _stuck_unverified_accounts(db: AsyncSession) -> list[StuckAccount]:
    cutoff = datetime.now(timezone.utc) - STUCK_ACCOUNT_AGE
    result = await db.execute(
        select(User)
        .where(User.email_verified_at.is_(None), User.created_at < cutoff)
        .order_by(User.created_at.asc())
        .limit(STUCK_ACCOUNT_LIMIT)
    )
    return [StuckAccount.model_validate(user) for user in result.scalars().all()]


async def get_health(
    db: AsyncSession, weaviate: WeaviateService, provider: EmbeddingProvider
) -> SystemHealth:
    services = [
        await _check_postgres(db),
        await _check_redis(),
        await _check_weaviate(weaviate),
        await _check_minio(),
    ]
    return SystemHealth(
        services=services,
        document_sync=await _document_sync(db, weaviate, provider),
        stuck_unverified_accounts=await _stuck_unverified_accounts(db),
    )