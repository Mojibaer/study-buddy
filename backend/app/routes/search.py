from fastapi import APIRouter, Query, Depends
from sqlalchemy.orm import Session
from typing import Optional, List
from app.database import get_db
from app.models import Document
from app.services.chroma_service import chroma_service

router = APIRouter()

@router.get("/semantic")
def semantic_search(
    query: str = Query(..., min_length=1),
    category: Optional[str] = None,
    subject: Optional[str] = None,
    limit: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_db)
):
    """
    Semantic search using ChromaDB with optional metadata filters
    """
    where_filter = {}
    if category:
        where_filter["category"] = category
    if subject:
        where_filter["subject"] = subject

    chroma_results = chroma_service.search(
        query=query,
        n_results=limit,
        filter_dict=where_filter if where_filter else None
    )

    if not chroma_results['ids'] or not chroma_results['ids'][0]:
        return {"results": [], "query": query}

    doc_ids = [
        int(metadata['document_id'])
        for metadata in chroma_results['metadatas'][0]
    ]

    documents = db.query(Document).filter(Document.id.in_(doc_ids)).all()

    results = []
    for i, doc_id in enumerate(doc_ids):
        doc = next((d for d in documents if d.id == doc_id), None)
        if doc:
            results.append({
                "document": {
                    "id": doc.id,
                    "filename": doc.original_filename,
                    "category": doc.category,
                    "subject": doc.subject,
                    "tags": doc.tags
                },
                "distance": chroma_results['distances'][0][i],
                "snippet": chroma_results['documents'][0][i][:200] + "..."
            })

    return {
        "query": query,
        "total_results": len(results),
        "results": results
    }