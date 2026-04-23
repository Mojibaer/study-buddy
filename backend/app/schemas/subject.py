from pydantic import BaseModel, ConfigDict

from app.schemas.semester import SemesterResponse


class SubjectBase(BaseModel):
    name: str
    semester_id: int

class SubjectCreate(SubjectBase):
    pass

class SubjectResponse(SubjectBase):
    id: int
    semester: SemesterResponse
    model_config = ConfigDict(from_attributes=True)
