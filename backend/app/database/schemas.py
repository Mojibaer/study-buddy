from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List

# Semester
class SemesterBase(BaseModel):
    name: str

class SemesterCreate(SemesterBase):
    pass

class SemesterResponse(SemesterBase):
    id: int

    class Config:
        from_attributes = True

# Category
class CategoryBase(BaseModel):
    name: str

class CategoryCreate(CategoryBase):
    pass

class CategoryResponse(CategoryBase):
    id: int

    class Config:
        from_attributes = True

# Subject
class SubjectBase(BaseModel):
    name: str
    semester_id: int

class SubjectCreate(SubjectBase):
    pass

class SubjectResponse(SubjectBase):
    id: int
    semester: SemesterResponse

    class Config:
        from_attributes = True

# Document
class DocumentBase(BaseModel):
    subject_id: Optional[int] = None
    category_id: Optional[int] = None
    tags: List[str] = []

class DocumentCreate(DocumentBase):
    filename: str

class DocumentResponse(DocumentBase):
    id: int
    filename: str
    original_filename: str
    file_type: str
    file_size: int
    file_url: Optional[str] = None
    subject: Optional[SubjectResponse] = None
    category: Optional[CategoryResponse] = None
    created_at: datetime

    class Config:
        from_attributes = True

# Filter-Endpoint
class FiltersResponse(BaseModel):
    semesters: List[SemesterResponse]
    subjects: List[SubjectResponse]
    categories: List[CategoryResponse]