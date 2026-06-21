from fastapi import APIRouter, Depends, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.dependencies import get_current_active_user
from app.database.database import get_db
from app.database.models import Bookmark, Document, Subject, User
from app.repositories.crud import get_document_or_404
from app.schemas.bookmark import BookmarkListResponse, BookmarkToggleResponse

# Per-user document bookmarks. Each route is scoped to the authenticated user —
# a user can only ever see or mutate their own bookmarks.
router = APIRouter()


@router.get("", response_model=BookmarkListResponse)
async def list_bookmarks(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> BookmarkListResponse:
    # Eager-load the same relations DocumentResponse serializes, newest first.
    result = await db.execute(
        select(Bookmark)
        .where(Bookmark.user_id == current_user.id)
        .order_by(Bookmark.created_at.desc())
        .options(
            selectinload(Bookmark.document).selectinload(Document.category),
            selectinload(Bookmark.document)
            .selectinload(Document.subject)
            .selectinload(Subject.semester),
        )
    )
    bookmarks = result.scalars().all()
    documents = [b.document for b in bookmarks if b.document is not None]
    return BookmarkListResponse(
        document_ids=[d.id for d in documents],
        documents=documents,
    )


@router.post("/{document_id}", response_model=BookmarkToggleResponse)
async def add_bookmark(
    document_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> BookmarkToggleResponse:
    # 404 if the document doesn't exist; idempotent if already bookmarked.
    await get_document_or_404(db, document_id)
    existing = await db.execute(
        select(Bookmark).where(
            Bookmark.user_id == current_user.id,
            Bookmark.document_id == document_id,
        )
    )
    if existing.scalar_one_or_none() is None:
        db.add(Bookmark(user_id=current_user.id, document_id=document_id))
        await db.commit()
    return BookmarkToggleResponse(document_id=document_id, bookmarked=True)


@router.delete("/{document_id}", response_model=BookmarkToggleResponse)
async def remove_bookmark(
    document_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> BookmarkToggleResponse:
    # Idempotent: removing a non-existent bookmark is a no-op success.
    result = await db.execute(
        select(Bookmark).where(
            Bookmark.user_id == current_user.id,
            Bookmark.document_id == document_id,
        )
    )
    bookmark = result.scalar_one_or_none()
    if bookmark is not None:
        await db.delete(bookmark)
        await db.commit()
    return BookmarkToggleResponse(document_id=document_id, bookmarked=False)
