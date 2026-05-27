import asyncio

from fastapi import APIRouter, Depends, HTTPException, status

from app.core.dependencies import get_embedding_provider, get_weaviate, require_admin
from app.services.embedding import EmbeddingProvider
from app.services.weaviate_service import WeaviateService

router = APIRouter(dependencies=[Depends(require_admin)])


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