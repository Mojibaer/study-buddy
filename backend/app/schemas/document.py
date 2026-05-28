from datetime import datetime

from pydantic import BaseModel, ConfigDict

from app.schemas.category import CategoryResponse
from app.schemas.subject import SubjectResponse
from app.schemas.user import UserResponse


class DocumentBase(BaseModel):
    subject_id: int
    category_id: int


class DocumentCreate(DocumentBase):
    filename: str


class DocumentResponse(DocumentBase):
    id: int
    filename: str
    original_filename: str
    file_type: str
    file_size: int
    file_url: str | None = None
    uploaded_by: int | None = None
    subject: SubjectResponse
    category: CategoryResponse
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)


class DocumentAdminResponse(DocumentBase):
    id: int
    filename: str
    original_filename: str
    file_type: str
    file_size: int
    file_url: str | None = None
    uploaded_by: int | None = None
    uploader: UserResponse | None = None
    subject: SubjectResponse
    category: CategoryResponse
    tags: list[str] = []
    vectorized_at: datetime | None = None
    indexed_in_weaviate: bool = False
    created_at: datetime
    updated_at: datetime | None = None
    model_config = ConfigDict(from_attributes=True)


class DocumentAdminUpdate(BaseModel):
    subject_id: int | None = None
    category_id: int | None = None
    tags: list[str] | None = None


class DocumentBulkDeleteRequest(BaseModel):
    ids: list[int]


class DocumentBulkDeleteResponse(BaseModel):
    deleted: list[int]
    not_found: list[int]