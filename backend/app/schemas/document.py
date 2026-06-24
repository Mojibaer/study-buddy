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
    vectorized_at: datetime | None = None
    indexed_in_weaviate: bool = False
    created_at: datetime
    updated_at: datetime | None = None
    model_config = ConfigDict(from_attributes=True)


class DocumentAdminUpdate(BaseModel):
    subject_id: int | None = None
    category_id: int | None = None


class DocumentBulkDeleteRequest(BaseModel):
    ids: list[int]


class DocumentBulkDeleteResponse(BaseModel):
    deleted: list[int]
    not_found: list[int]


class BulkUploadItemResult(BaseModel):
    """Per-file outcome of a bulk upload. `status` is one of:
    'uploaded', 'plagiarism', 'rate_limited', 'error'."""
    filename: str
    status: str
    document: DocumentResponse | None = None
    similar_document: dict | None = None
    message: str | None = None


class BulkUploadResponse(BaseModel):
    results: list[BulkUploadItemResult]
    uploaded: int
    failed: int