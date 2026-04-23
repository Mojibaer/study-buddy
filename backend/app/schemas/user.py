from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr

from app.database.models import UserRole


class UserBase(BaseModel):
    email: EmailStr
    username: str

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: int
    role: UserRole
    is_active: bool
    email_verified_at: datetime | None = None
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)
