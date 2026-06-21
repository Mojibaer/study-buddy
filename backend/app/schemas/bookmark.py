from pydantic import BaseModel

from app.schemas.document import DocumentResponse


class BookmarkToggleResponse(BaseModel):
    document_id: int
    bookmarked: bool


class BookmarkListResponse(BaseModel):
    document_ids: list[int]
    documents: list[DocumentResponse]
