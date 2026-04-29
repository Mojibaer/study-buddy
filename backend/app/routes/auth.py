import secrets
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.dependencies import get_current_active_user
from app.core.redis import consume_verify_token, store_verify_token
from app.core.security import (
    create_access_token,
    create_refresh_token,
    get_password_hash,
    get_refresh_token_expiry,
    verify_password,
    verify_refresh_token_hash,
)
from app.database.database import get_db
from app.database.models import RefreshToken, User
from app.schemas.token import TokenResponse
from app.schemas.user import UserRegister, UserResponse, UserSetup

router = APIRouter()


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(body: UserRegister, db: AsyncSession = Depends(get_db)) -> User:
    result = await db.execute(select(User).where(User.email == body.email))
    if result.scalar_one_or_none() is not None:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already registered")

    user = User(email=body.email)
    db.add(user)
    await db.commit()
    await db.refresh(user)

    verify_token = secrets.token_urlsafe(32)
    await store_verify_token(verify_token, user.id)
    # TODO: send verify_token via email

    return user


@router.post("/setup", response_model=TokenResponse)
async def setup(body: UserSetup, db: AsyncSession = Depends(get_db)) -> TokenResponse:
    user_id = await consume_verify_token(body.token)
    if user_id is None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid or expired verification token")

    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if user is None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="User not found")

    if user.username is not None or user.password_hash is not None:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Account already set up")

    result_username = await db.execute(select(User).where(User.username == body.username))
    if result_username.scalar_one_or_none() is not None:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Username already taken")

    user.username = body.username
    user.password_hash = get_password_hash(body.password)
    user.email_verified_at = datetime.now(timezone.utc)
    await db.commit()
    await db.refresh(user)

    access_token, _ = create_access_token(subject=user.id)
    raw_refresh, refresh_hash = create_refresh_token()
    db.add(RefreshToken(
        user_id=user.id,
        token_hash=refresh_hash,
        expires_at=get_refresh_token_expiry(),
    ))
    await db.commit()

    return TokenResponse(access_token=access_token, refresh_token=raw_refresh)


@router.post("/login", response_model=TokenResponse)
async def login(
    request: Request,
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: AsyncSession = Depends(get_db),
) -> TokenResponse:
    result = await db.execute(select(User).where(User.email == form_data.username))
    user = result.scalar_one_or_none()

    if user is None or user.password_hash is None or not verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Inactive user")

    access_token, _ = create_access_token(
        subject=user.id,
        expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES),
    )
    raw_refresh, refresh_hash = create_refresh_token()

    db_refresh = RefreshToken(
        user_id=user.id,
        token_hash=refresh_hash,
        expires_at=get_refresh_token_expiry(),
    )
    db.add(db_refresh)
    await db.commit()

    return TokenResponse(access_token=access_token, refresh_token=raw_refresh)


@router.post("/refresh", response_model=TokenResponse)
async def refresh_tokens(raw_refresh_token: str, db: AsyncSession = Depends(get_db)) -> TokenResponse:
    result = await db.execute(
        select(RefreshToken).where(RefreshToken.revoked.is_(False))
    )
    stored: RefreshToken | None = None
    for row in result.scalars().all():
        if verify_refresh_token_hash(raw_refresh_token, row.token_hash):
            stored = row
            break

    if stored is None or stored.expires_at < datetime.now(timezone.utc):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired refresh token")

    stored.revoked = True
    await db.flush()

    access_token, _ = create_access_token(subject=stored.user_id)
    raw_new, new_hash = create_refresh_token()

    new_token = RefreshToken(
        user_id=stored.user_id,
        token_hash=new_hash,
        expires_at=get_refresh_token_expiry(),
    )
    db.add(new_token)
    await db.commit()

    return TokenResponse(access_token=access_token, refresh_token=raw_new)


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
async def logout(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
) -> None:
    # Revoke all active refresh tokens for this user
    result = await db.execute(
        select(RefreshToken).where(
            RefreshToken.user_id == current_user.id,
            RefreshToken.revoked.is_(False),
        )
    )
    for token in result.scalars().all():
        token.revoked = True
    await db.commit()


@router.get("/me", response_model=UserResponse)
async def me(current_user: User = Depends(get_current_active_user)) -> User:
    return current_user
