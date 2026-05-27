from pydantic import BaseModel, ConfigDict, Field

from app.schemas.category import CategoryResponse
from app.schemas.semester import SemesterResponse
from app.schemas.subject import SubjectResponse


class SemesterUpdate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)


class SubjectUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=255)
    semester_id: int | None = None


class CategoryUpdate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)


class SemesterAdminResponse(SemesterResponse):
    subject_count: int
    document_count: int


class SubjectAdminResponse(SubjectResponse):
    document_count: int


class CategoryAdminResponse(CategoryResponse):
    document_count: int


class StructureOverview(BaseModel):
    semesters: list[SemesterAdminResponse]
    subjects: list[SubjectAdminResponse]
    categories: list[CategoryAdminResponse]
    model_config = ConfigDict(from_attributes=True)