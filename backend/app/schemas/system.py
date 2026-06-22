from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict


class ServiceStatus(BaseModel):
    name: str
    status: Literal["up", "down"]
    detail: str | None = None


class DocumentSync(BaseModel):
    postgres_documents: int
    weaviate_documents: int | None
    unindexed_documents: int
    in_sync: bool


class StuckAccount(BaseModel):
    id: int
    email: str
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)


class SystemHealth(BaseModel):
    services: list[ServiceStatus]
    document_sync: DocumentSync
    stuck_unverified_accounts: list[StuckAccount]
