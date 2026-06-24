from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import require_admin
from app.database.database import get_db
from app.database.models import User
from app.schemas.analytics import AnalyticsOverview
from app.services import admin_analytics_service

router = APIRouter()


@router.get("/overview", response_model=AnalyticsOverview)
async def overview(
        db: AsyncSession = Depends(get_db),
        _admin: User = Depends(require_admin),
) -> AnalyticsOverview:
    return await admin_analytics_service.get_overview(db)
