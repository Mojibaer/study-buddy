from typing import Callable, Coroutine

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.redis import is_token_denied
from app.core.security import decode_token_payload
from app.database.database import get_db
from app.database.models import User, UserRole

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")


async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db),
) -> User:
    # Unified 401 for all failure cases — intentional, prevents user enumeration
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    payload = decode_token_payload(token)
    if payload is None:
        raise credentials_exception

    jti = payload.get("jti")
    if jti is None or await is_token_denied(jti):
        raise credentials_exception

    try:
        user_id = int(payload["sub"])
    except (KeyError, ValueError, TypeError):
        raise credentials_exception

    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if user is None:
        raise credentials_exception
    return user


async def get_current_active_user(
    current_user: User = Depends(get_current_user),
) -> User:
    if not current_user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Inactive user")
    if current_user.email_verified_at is None:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Email not verified")
    return current_user


def require_role(role: UserRole) -> Callable[[User], Coroutine[None, None, User]]:
    """Dependency factory: passes through the user only if their role matches."""
    async def _checker(current_user: User = Depends(get_current_active_user)) -> User:
        if current_user.role != role:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Requires {role.value} role",
            )
        return current_user
    return _checker


require_admin = require_role(UserRole.admin)
