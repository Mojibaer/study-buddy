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
