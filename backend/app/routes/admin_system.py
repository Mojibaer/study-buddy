from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_embedding_provider, get_weaviate, require_admin
from app.database.database import get_db
from app.database.models import User
from app.schemas.system import SystemHealth
from app.services import admin_system_service
from app.services.embedding import EmbeddingProvider
from app.services.weaviate_service import WeaviateService

router = APIRouter()


@router.get("/health", response_model=SystemHealth)
async def health(
        db: AsyncSession = Depends(get_db),
        weaviate: WeaviateService = Depends(get_weaviate),
        provider: EmbeddingProvider = Depends(get_embedding_provider),
        _admin: User = Depends(require_admin),
) -> SystemHealth:
    return await admin_system_service.get_health(db, weaviate, provider)
