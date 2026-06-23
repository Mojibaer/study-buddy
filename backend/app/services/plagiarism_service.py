import asyncio
import logging

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.database.models import Document, Subject
from app.services.embedding import EmbeddingProvider
from app.services.weaviate_service import WeaviateService

logger = logging.getLogger(__name__)


class SimilarMatch:
    """The existing document an upload collided with, with its similarity score."""

    def __init__(self, document_id: int, original_filename: str, subject: str | None, score: float) -> None:
        self.document_id = document_id
        self.original_filename = original_filename
        self.subject = subject
        self.score = score

    def as_detail(self) -> dict:
        return {
            "id": self.document_id,
            "original_filename": self.original_filename,
            "subject": self.subject,
            "score": round(self.score, 4),
        }


async def find_similar_above_threshold(
    db: AsyncSession,
    provider: EmbeddingProvider,
    weaviate: WeaviateService,
    vector: list[float],
    threshold: float,
) -> SimilarMatch | None:
    """Return the most similar existing document if its score is >= threshold,
    else None. Score is cosine similarity (1 - distance), 0..1."""
    hits = await asyncio.to_thread(weaviate.search, provider.name, vector, None, 1)
    if not hits:
        return None

    top = hits[0]
    score = top.get("score")
    if score is None or score < threshold:
        return None

    doc = (
        await db.execute(
            select(Document)
            .options(selectinload(Document.subject).selectinload(Subject.semester))
            .where(Document.id == top["document_id"])
        )
    ).scalars().first()

    # Vector exists but the document was removed from Postgres — treat as no match
    # rather than blocking against a phantom.
    if doc is None:
        logger.warning(
            "Plagiarism check hit document_id=%d with no Postgres row; ignoring",
            top["document_id"],
        )
        return None

    return SimilarMatch(
        document_id=doc.id,
        original_filename=doc.original_filename,
        subject=doc.subject.name if doc.subject else None,
        score=score,
    )
