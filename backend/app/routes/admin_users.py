import secrets

from fastapi import APIRouter, Depends, HTTPException, Query, Request, status
from sqlalchemy import delete, func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import require_admin
from app.core.redis import store_verify_token
from app.database.database import get_db
from app.database.models import RefreshToken, User, UserRole
from app.schemas.user import UserAdminUpdate, UserResponse
from app.services.email_service import send_verify_email

router = APIRouter()


async def _get_user_or_404(db: AsyncSession, user_id: int) -> User:
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return user


def _forbid_self_target(target_id: int, current: User, action: str) -> None:
    if target_id == current.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"You cannot {action} your own account",
        )


async def _forbid_last_admin(db: AsyncSession, target: User, action: str) -> None:
    """Block removing the last active admin, which would lock everyone out."""
    if target.role != UserRole.admin or not target.is_active:
        return
    active_admins = await db.scalar(
        select(func.count(User.id)).where(
            User.role == UserRole.admin,
            User.is_active.is_(True),
        )
    )
    if active_admins is not None and active_admins <= 1:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"You cannot {action} the last active admin",
        )


@router.get("", response_model=list[UserResponse])
async def list_users(
    role: UserRole | None = Query(default=None),
    is_active: bool | None = Query(default=None),
    is_verified: bool | None = Query(default=None),
    search: str | None = Query(default=None, min_length=1, max_length=200),
    db: AsyncSession = Depends(get_db),
    _admin: User = Depends(require_admin),
) -> list[User]:
    query = select(User).order_by(User.created_at.desc())

    if role is not None:
        query = query.where(User.role == role)
    if is_active is not None:
        query = query.where(User.is_active.is_(is_active))
    if is_verified is True:
        query = query.where(User.email_verified_at.is_not(None))
    elif is_verified is False:
        query = query.where(User.email_verified_at.is_(None))
    if search:
        pattern = f"%{search.lower()}%"
        query = query.where(or_(User.email.ilike(pattern), User.username.ilike(pattern)))

    result = await db.execute(query)
    return result.scalars().all()


@router.patch("/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: int,
    body: UserAdminUpdate,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(require_admin),
) -> User:
    user = await _get_user_or_404(db, user_id)

    if body.role is not None and body.role != user.role:
        if user_id == admin.id and body.role != UserRole.admin:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="You cannot demote your own admin account",
            )
        if body.role != UserRole.admin:
            await _forbid_last_admin(db, user, "demote")
        user.role = body.role

    if body.is_active is not None and body.is_active != user.is_active:
        if user_id == admin.id and body.is_active is False:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="You cannot deactivate your own account",
            )
        if body.is_active is False:
            await _forbid_last_admin(db, user, "deactivate")
        user.is_active = body.is_active
        if body.is_active is False:
            await _revoke_user_sessions(db, user_id)

    await db.commit()
    await db.refresh(user)
    return user


@router.post("/{user_id}/resend-verification", response_model=UserResponse)
async def resend_verification(
    request: Request,
    user_id: int,
    db: AsyncSession = Depends(get_db),
    _admin: User = Depends(require_admin),
) -> User:
    user = await _get_user_or_404(db, user_id)

    if user.email_verified_at is not None or user.password_hash is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Account is already verified",
        )

    verify_token = secrets.token_urlsafe(32)
    await store_verify_token(verify_token, user.id)

    accept_language = request.headers.get("accept-language", "")
    locale = "de" if accept_language.lower().startswith("de") else "en"
    await send_verify_email(user.email, verify_token, locale=locale)

    return user


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(
    user_id: int,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(require_admin),
) -> None:
    _forbid_self_target(user_id, admin, "delete")

    user = await _get_user_or_404(db, user_id)
    await _forbid_last_admin(db, user, "delete")
    await _revoke_user_sessions(db, user_id, delete_rows=True)
    await db.delete(user)
    await db.commit()


async def _revoke_user_sessions(db: AsyncSession, user_id: int, delete_rows: bool = False) -> None:
    if delete_rows:
        await db.execute(delete(RefreshToken).where(RefreshToken.user_id == user_id))
        return
    result = await db.execute(
        select(RefreshToken).where(
            RefreshToken.user_id == user_id,
            RefreshToken.revoked.is_(False),
        )
    )
    for token in result.scalars().all():
        token.revoked = True