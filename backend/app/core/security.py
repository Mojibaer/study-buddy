import hashlib
import hmac
import secrets
import uuid
from datetime import datetime, timedelta, timezone

import jwt
from passlib.context import CryptContext

from app.core.config import settings

pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")


def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def create_access_token(subject: int, expires_delta: timedelta | None = None) -> tuple[str, str]:
    """Returns (encoded_jwt, jti). Store jti for revocation on logout."""
    now = datetime.now(timezone.utc)
    expire = now + (expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES))
    jti = str(uuid.uuid4())
    payload = {
        "sub": str(subject),
        "iat": now,
        "exp": expire,
        "jti": jti,
        "type": "access",
        "iss": settings.JWT_ISSUER,
        "aud": settings.JWT_AUDIENCE,
    }
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM), jti


def decode_token_payload(token: str) -> dict | None:
    """Returns full payload dict, or None if invalid. Caller must check jti denylist."""
    try:
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM],
            audience=settings.JWT_AUDIENCE,
            issuer=settings.JWT_ISSUER,
        )
        if payload.get("type") != "access":
            return None
        return payload
    except (jwt.PyJWTError, ValueError, TypeError):
        return None


def _sha256_hex(value: str) -> str:
    return hashlib.sha256(value.encode()).hexdigest()


def create_refresh_token() -> tuple[str, str]:
    """Returns (raw_token, hashed_token). Store the hash, send the raw token to client."""
    raw = secrets.token_urlsafe(64)
    return raw, _sha256_hex(raw)


def hash_refresh_token(raw_token: str) -> str:
    return _sha256_hex(raw_token)


def verify_refresh_token_hash(raw_token: str, stored_hash: str) -> bool:
    return hmac.compare_digest(_sha256_hex(raw_token), stored_hash)


def get_refresh_token_expiry() -> datetime:
    return datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
