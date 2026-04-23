from pydantic import BaseModel, ConfigDict, Field


class SemesterBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)

class SemesterCreate(SemesterBase):
    pass

class SemesterResponse(SemesterBase):
    id: int
    model_config = ConfigDict(from_attributes=True)
