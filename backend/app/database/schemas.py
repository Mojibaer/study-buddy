from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List

class DocumentBase(BaseModel):
    filename: str
    original_filename: str
    category: Optional[str] = None
    subject: Optional[str] = None
    semester: Optional[str] = None
    tags: List[str] = []

class DocumentCreate(DocumentBase):
    pass

class DocumentResponse(DocumentBase):
    id: int
    file_type: str
    file_size: int
    file_url: str | None = None
    created_at: datetime

    class Config:
        from_attributes = True

class SubjectBase(BaseModel):
    name: str
    semester: str | None = None

class SubjectCreate(SubjectBase):
    pass

class SubjectResponse(SubjectBase):
    id: int

    class Config:
        orm_mode = True
