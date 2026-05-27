import asyncio
import logging
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_embedding_provider, get_weaviate, require_admin
from app.database.database import get_db
from app.database.models import Document, Subject
from app.services.document_service import extract_text_from_bytes
from app.services.embedding import EmbeddingProvider
from app.services.minio_service import download_file
from app.services.weaviate_service import WeaviateService

logger = logging.getLogger(__name__)

router = APIRouter(dependencies=[Depends(require_admin)])

EMBED_TEXT_MAX_CHARS = 8000
SNIPPET_MAX_CHARS = 500


@router.get("/collections")
async def list_collections(
    weaviate: WeaviateService = Depends(get_weaviate),
) -> dict:
    names = await asyncio.to_thread(weaviate.list_collections)
    return {"collections": names}


@router.get("/count")
async def count_active(
    weaviate: WeaviateService = Depends(get_weaviate),
    provider: EmbeddingProvider = Depends(get_embedding_provider),
) -> dict:
    total = await asyncio.to_thread(weaviate.count, provider.name)
    return {"provider": provider.name, "count": total}


@router.delete("/{document_id}")
async def delete_vector(
    document_id: int,
    weaviate: WeaviateService = Depends(get_weaviate),
    provider: EmbeddingProvider = Depends(get_embedding_provider),
) -> dict:
    deleted = await asyncio.to_thread(
        weaviate.delete_document, provider.name, document_id
    )
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Vector not found in active provider collection",
        )
    return {"message": "Vector deleted", "document_id": document_id}


@router.post("/reindex")
async def reindex_pending(
    limit: int = Query(50, ge=1, le=500),
    db: AsyncSession = Depends(get_db),
    provider: EmbeddingProvider = Depends(get_embedding_provider),
    weaviate: WeaviateService = Depends(get_weaviate),
) -> dict:
    stmt = (
        select(Document)
        .where(Document.vectorized_at.is_(None))
        .order_by(Document.created_at.asc())
        .limit(limit)
    )
    pending = (await db.execute(stmt)).scalars().all()

    indexed = 0
    failed: list[int] = []
    for doc in pending:
        try:
            file_bytes = await asyncio.to_thread(download_file, doc.filename)
            text = extract_text_from_bytes(file_bytes, doc.file_type)
            if not text:
                logger.warning("Document %d has no extractable text; skipping", doc.id)
                failed.append(doc.id)
                continue
            subject = (await db.execute(
                select(Subject).where(Subject.id == doc.subject_id)
            )).scalars().first()
            searchable = text + (f" Fach: {subject.name}" if subject else "")
            vector = await asyncio.to_thread(provider.embed, searchable[:EMBED_TEXT_MAX_CHARS])
            await asyncio.to_thread(
                weaviate.insert_document,
                provider.name,
                doc.id,
                searchable[:SNIPPET_MAX_CHARS],
                vector,
            )
            doc.vectorized_at = datetime.now(timezone.utc)
            await db.commit()
            indexed += 1
        except Exception:
            await db.rollback()
            logger.exception("Failed to reindex document %d", doc.id)
            failed.append(doc.id)

    return {
        "scanned": len(pending),
        "indexed": indexed,
        "failed": failed,
    }