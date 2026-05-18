import secrets
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Cookie, Depends, HTTPException, Request, Response, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.dependencies import get_current_active_user, get_token_payload
from app.core.limiter import limiter
from app.core.redis import consume_verify_token, denylist_token, store_verify_token
from app.services.email_service import send_verify_email
from app.core.security import (
    create_access_token,
    create_refresh_token,
    get_password_hash,
    get_refresh_token_expiry,
    hash_refresh_token,
    verify_password,
)
from app.database.database import get_db
from app.database.models import RefreshToken, User
from app.schemas.token import TokenResponse
from app.schemas.user import UserRegister, UserResponse, UserSetup

router = APIRouter()


def _set_refresh_cookie(response: Response, raw_refresh_token: str) -> None:
    response.set_cookie(
        key=settings.REFRESH_COOKIE_NAME,
        value=raw_refresh_token,
        max_age=settings.REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60,
        path=settings.REFRESH_COOKIE_PATH,
        domain=settings.REFRESH_COOKIE_DOMAIN,
        secure=settings.REFRESH_COOKIE_SECURE,
        httponly=True,
        samesite=settings.REFRESH_COOKIE_SAMESITE,
    )


def _clear_refresh_cookie(response: Response) -> None:
    response.delete_cookie(
        key=settings.REFRESH_COOKIE_NAME,
        path=settings.REFRESH_COOKIE_PATH,
        domain=settings.REFRESH_COOKIE_DOMAIN,
    )


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
@limiter.limit("3/minute")
async def register(
    request: Request,
    body: UserRegister,
    db: AsyncSession = Depends(get_db),
) -> User:
    result = await db.execute(select(User).where(User.email == body.email))
    if result.scalar_one_or_none() is not None:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already registered")

    user = User(email=body.email)
    db.add(user)
    await db.commit()
    await db.refresh(user)

    verify_token = secrets.token_urlsafe(32)
    await store_verify_token(verify_token, user.id)

    accept_language = request.headers.get("accept-language", "")
    locale = "de" if accept_language.lower().startswith("de") else "en"
    await send_verify_email(user.email, verify_token, locale=locale)

    return user


@router.post("/setup", response_model=TokenResponse)
@limiter.limit("5/minute")
async def setup(
    request: Request,
    body: UserSetup,
    response: Response,
    db: AsyncSession = Depends(get_db),
) -> TokenResponse:
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

    _set_refresh_cookie(response, raw_refresh)
    return TokenResponse(access_token=access_token)


@router.post("/login", response_model=TokenResponse)
@limiter.limit("5/minute")
async def login(
    request: Request,
    response: Response,
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

    _set_refresh_cookie(response, raw_refresh)
    return TokenResponse(access_token=access_token)


@router.post("/refresh", response_model=TokenResponse)
@limiter.limit("10/minute")
async def refresh_tokens(
    request: Request,
    response: Response,
    refresh_token: str | None = Cookie(default=None, alias=settings.REFRESH_COOKIE_NAME),
    db: AsyncSession = Depends(get_db),
) -> TokenResponse:
    if refresh_token is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing refresh token")

    # Indexed lookup on token_hash — SHA-256 of the raw token. The hash is
    # deterministic, so a direct WHERE clause is O(log n) via the index.
    token_hash = hash_refresh_token(refresh_token)
    result = await db.execute(
        select(RefreshToken).where(
            RefreshToken.token_hash == token_hash,
            RefreshToken.revoked.is_(False),
        )
    )
    stored = result.scalar_one_or_none()

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

    _set_refresh_cookie(response, raw_new)
    return TokenResponse(access_token=access_token)


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
async def logout(
    response: Response,
    payload: dict = Depends(get_token_payload),
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
) -> None:
    # Denylist the access token JTI so it cannot be reused before exp.
    # TTL equals the token's remaining lifetime — Redis evicts the entry afterwards.
    jti = payload.get("jti")
    exp = payload.get("exp")
    if jti and isinstance(exp, int):
        now_ts = int(datetime.now(timezone.utc).timestamp())
        remaining = exp - now_ts
        if remaining > 0:
            await denylist_token(jti, remaining)

    result = await db.execute(
        select(RefreshToken).where(
            RefreshToken.user_id == current_user.id,
            RefreshToken.revoked.is_(False),
        )
    )
    for token in result.scalars().all():
        token.revoked = True
    await db.commit()

    _clear_refresh_cookie(response)


@router.get("/me", response_model=UserResponse)
async def me(current_user: User = Depends(get_current_active_user)) -> User:
    return current_user
