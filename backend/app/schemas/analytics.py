from pydantic import BaseModel


class UploadActivityPoint(BaseModel):
    date: str
    count: int


class SubjectCoverage(BaseModel):
    subject_id: int
    subject_name: str
    semester_name: str
    document_count: int


class AnalyticsOverview(BaseModel):
    total_documents: int
    total_users: int
    total_storage_bytes: int
    upload_activity: list[UploadActivityPoint]
    subject_coverage: list[SubjectCoverage]