from datetime import datetime

from pydantic import BaseModel, ConfigDict

from app.schemas.category import CategoryResponse
from app.schemas.subject import SubjectResponse


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
