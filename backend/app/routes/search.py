import asyncio
import logging

from fastapi import APIRouter, Depends, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.dependencies import (
    get_current_active_user,
    get_embedding_provider,
    get_weaviate,
)
from app.database.database import get_db
from app.database.models import Document, Subject, User
from app.services.embedding import EmbeddingProvider
from app.services.minio_service import get_presigned_url
from app.services.weaviate_service import WeaviateService

logger = logging.getLogger(__name__)

router = APIRouter()


@router.get("/semantic")
async def semantic_search(
    query: str = Query(..., min_length=1),
    category_id: int | None = None,
    subject_id: int | None = None,
    semester_id: int | None = None,
    limit: int = Query(10, ge=1, le=50),
    db: AsyncSession = Depends(get_db),
    provider: EmbeddingProvider = Depends(get_embedding_provider),
    weaviate: WeaviateService = Depends(get_weaviate),
    _current_user: User = Depends(get_current_active_user),
) -> dict:
    pre_filter_ids: list[int] | None = None
    if category_id is not None or subject_id is not None or semester_id is not None:
        stmt = select(Document.id)
        if semester_id is not None:
            stmt = stmt.join(Subject, Document.subject_id == Subject.id)
        if category_id is not None:
            stmt = stmt.where(Document.category_id == category_id)
        if subject_id is not None:
            stmt = stmt.where(Document.subject_id == subject_id)
        if semester_id is not None:
            stmt = stmt.where(Subject.semester_id == semester_id)
        pre_filter_ids = list((await db.execute(stmt)).scalars().all())
        if not pre_filter_ids:
            return {"query": query, "total_results": 0, "results": []}

    query_vector = await asyncio.to_thread(provider.embed_query, query)
    hits = await asyncio.to_thread(
        weaviate.search, provider.name, query_vector, pre_filter_ids, limit
    )

    if not hits:
        return {"query": query, "total_results": 0, "results": []}

    hit_doc_ids = [hit["document_id"] for hit in hits]
    docs = (await db.execute(
        select(Document)
        .options(
            selectinload(Document.category),
            selectinload(Document.subject).selectinload(Subject.semester),
        )
        .where(Document.id.in_(hit_doc_ids))
    )).scalars().all()
    docs_by_id = {d.id: d for d in docs}

    results = []
    for hit in hits:
        doc = docs_by_id.get(hit["document_id"])
        if doc is None:
            logger.warning(
                "Weaviate returned vector for missing document_id=%d",
                hit["document_id"],
            )
            continue
        text = hit["text"] or ""
        snippet = text[:200] + "..." if len(text) > 200 else text
        results.append({
            "document": {
                "id": doc.id,
                "filename": doc.filename,
                "original_filename": doc.original_filename,
                "file_type": doc.file_type,
                "file_size": doc.file_size,
                "file_url": get_presigned_url(doc.filename) if doc.filename else doc.file_url,
                "category": {"id": doc.category.id, "name": doc.category.name} if doc.category else None,
                "subject": {
                    "id": doc.subject.id,
                    "name": doc.subject.name,
                    "semester": {
                        "id": doc.subject.semester.id,
                        "name": doc.subject.semester.name,
                    } if doc.subject.semester else None,
                } if doc.subject else None,
            },
            "score": hit["score"],
            "snippet": snippet,
        })

    return {
        "query": query,
        "total_results": len(results),
        "results": results,
    }
