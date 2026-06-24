from typing import Literal

from pydantic import field_validator
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    SECRET_KEY: str
    ALGORITHM: Literal["HS256"] = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    JWT_ISSUER: str = "studybuddy-api"
    JWT_AUDIENCE: str = "studybuddy-client"
    REDIS_URL: str = "redis://localhost:6379"

    # Refresh token cookie (ADR-0001). Dev defaults: SameSite=lax + Secure=false for plain-HTTP localhost.
    # Production: override via .env to SameSite=strict + Secure=true.
    REFRESH_COOKIE_NAME: str = "refresh_token"
    REFRESH_COOKIE_PATH: str = "/api/auth"
    REFRESH_COOKIE_SAMESITE: Literal["lax", "strict", "none"] = "lax"
    REFRESH_COOKIE_SECURE: bool = False
    REFRESH_COOKIE_DOMAIN: str | None = None

    # Weaviate
    WEAVIATE_HTTP_HOST: str = "localhost"
    WEAVIATE_HTTP_PORT: int = 8100
    WEAVIATE_GRPC_HOST: str = "localhost"
    WEAVIATE_GRPC_PORT: int = 50051
    WEAVIATE_HTTP_SECURE: bool = False
    WEAVIATE_GRPC_SECURE: bool = False
    WEAVIATE_API_KEY: str | None = None

    # Embedding
    EMBEDDING_PROVIDER: Literal["voyage", "fastembed"] = "fastembed"
    VOYAGE_API_KEY: str | None = None
    VOYAGE_MODEL: Literal[
        "voyage-4-large",
        "voyage-3-large",
        "voyage-3",
        "voyage-3-lite",
    ] = "voyage-4-large"
    # Retry Voyage embed calls when the rate limit (3 RPM on the free tier) is hit.
    # Backoff is fixed at slightly above the 1-minute window so a retry lands in a
    # fresh quota bucket. Raise the backoff or lower retries if you add billing.
    VOYAGE_MAX_RETRIES: int = 3
    VOYAGE_RETRY_BACKOFF_SECONDS: float = 20.0
    FASTEMBED_MODEL: str = "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2"

    # Plagiarism check — block upload when a vector is at least this similar
    # (cosine, 0..1) to an existing document. Set high to avoid false positives
    # on legitimate topical overlap (same lecture). Tune per embedding model.
    PLAGIARISM_THRESHOLD: float = 0.95

    # Mail (Mailpit locally, real SMTP provider in production)
    SMTP_HOST: str = "localhost"
    SMTP_PORT: int = 1025
    SMTP_USER: str = ""
    SMTP_PASSWORD: str = ""
    SMTP_STARTTLS: bool = False
    SMTP_SSL: bool = False
    MAIL_FROM: str = "no-reply@studybuddy.app"
    MAIL_FROM_NAME: str = "Study Buddy"
    FRONTEND_BASE_URL: str = "http://localhost:3000"

    @field_validator("SECRET_KEY")
    @classmethod
    def secret_key_min_length(cls, v: str) -> str:
        if len(v) < 32:
            raise ValueError("SECRET_KEY must be at least 32 characters")
        return v

    model_config = {"env_file": ".env", "extra": "ignore"}


settings = Settings()
