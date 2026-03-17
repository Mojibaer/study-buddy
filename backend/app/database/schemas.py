from pydantic import BaseModel, ConfigDict
from datetime import datetime


# Semester
class SemesterBase(BaseModel):
    name: str

class SemesterCreate(SemesterBase):
    pass

class SemesterResponse(SemesterBase):
    id: int
    model_config = ConfigDict(from_attributes=True)


# Category
class CategoryBase(BaseModel):
    name: str

class CategoryCreate(CategoryBase):
    pass

class CategoryResponse(CategoryBase):
    id: int
    model_config = ConfigDict(from_attributes=True)


# Subject
class SubjectBase(BaseModel):
    name: str
    semester_id: int

class SubjectCreate(SubjectBase):
    pass

class SubjectResponse(SubjectBase):
    id: int
    semester: SemesterResponse
    model_config = ConfigDict(from_attributes=True)


# Document
class DocumentBase(BaseModel):
    subject_id: int | None = None
    category_id: int | None = None
    tags: list[str] = []

class DocumentCreate(DocumentBase):
    filename: str

class DocumentResponse(DocumentBase):
    id: int
    filename: str
    original_filename: str
    file_type: str
    file_size: int
    file_url: str | None = None
    subject: SubjectResponse | None = None
    category: CategoryResponse | None = None
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)


# Filter-Endpoint
class FiltersResponse(BaseModel):
    semesters: list[SemesterResponse]
    subjects: list[SubjectResponse]
    categories: list[CategoryResponse]
