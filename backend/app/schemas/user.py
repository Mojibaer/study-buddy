from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, field_validator

from app.database.models import UserRole


_ALLOWED_EMAIL_DOMAIN = "@edu.fh-joanneum.at"


class UserRegister(BaseModel):
    email: EmailStr

    @field_validator("email")
    @classmethod
    def fh_email_only(cls, v: str) -> str:
        if not v.lower().endswith(_ALLOWED_EMAIL_DOMAIN):
            raise ValueError("Only FH Joanneum student email addresses are allowed (@edu.fh-joanneum.at)")
        return v.lower()


class UserSetup(BaseModel):
    token: str
    username: str
    password: str


class UserResponse(BaseModel):
    id: int
    email: EmailStr
    username: str | None
    role: UserRole
    is_active: bool
    email_verified_at: datetime | None = None
    cohort_id: int | None = None
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)


class UserBase(BaseModel):
    email: EmailStr
    username: str | None = None

class UserCreate(UserBase):
    password: str
