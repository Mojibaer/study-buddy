from datetime import datetime

from pydantic import BaseModel, ConfigDict


class RefreshTokenCreate(BaseModel):
    user_id: int
    token_hash: str
    expires_at: datetime

class RefreshTokenResponse(BaseModel):
    id: int
    user_id: int
    revoked: bool
    expires_at: datetime
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)
