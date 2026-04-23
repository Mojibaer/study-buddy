from pydantic import BaseModel

from app.schemas.semester import SemesterResponse
from app.schemas.subject import SubjectResponse
from app.schemas.category import CategoryResponse


class FiltersResponse(BaseModel):
    semesters: list[SemesterResponse]
    subjects: list[SubjectResponse]
    categories: list[CategoryResponse]
