from fastapi import APIRouter, Depends, Query, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import require_admin
from app.database.database import get_db
from app.database.models import User, UserRole
from app.schemas.user import UserAdminUpdate, UserResponse
from app.services import admin_user_service

router = APIRouter()


@router.get("", response_model=list[UserResponse])
async def list_users(
    role: UserRole | None = Query(default=None),
    is_active: bool | None = Query(default=None),
    is_verified: bool | None = Query(default=None),
    search: str | None = Query(default=None, min_length=1, max_length=200),
    db: AsyncSession = Depends(get_db),
    _admin: User = Depends(require_admin),
) -> list[User]:
    return await admin_user_service.list_users(
        db,
        role=role,
        is_active=is_active,
        is_verified=is_verified,
        search=search,
    )


@router.patch("/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: int,
    body: UserAdminUpdate,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(require_admin),
) -> User:
    return await admin_user_service.update_user(db, admin, user_id, body)


@router.post("/{user_id}/resend-verification", response_model=UserResponse)
async def resend_verification(
    request: Request,
    user_id: int,
    db: AsyncSession = Depends(get_db),
    _admin: User = Depends(require_admin),
) -> User:
    accept_language = request.headers.get("accept-language", "")
    locale = "de" if accept_language.lower().startswith("de") else "en"
    return await admin_user_service.resend_verification(db, user_id, locale=locale)


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(
    user_id: int,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(require_admin),
) -> None:
    await admin_user_service.delete_user(db, admin, user_id)
