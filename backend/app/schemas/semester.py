from pydantic import BaseModel, ConfigDict


class SemesterBase(BaseModel):
    name: str

class SemesterCreate(SemesterBase):
    pass

class SemesterResponse(SemesterBase):
    id: int
    model_config = ConfigDict(from_attributes=True)
