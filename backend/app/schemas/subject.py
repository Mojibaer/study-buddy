from pydantic import BaseModel, ConfigDict, Field

from app.schemas.semester import SemesterResponse


class SubjectBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    semester_id: int

class SubjectCreate(SubjectBase):
    pass

class SubjectResponse(SubjectBase):
    id: int
    semester: SemesterResponse
    model_config = ConfigDict(from_attributes=True)
