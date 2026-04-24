import logging

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.util import get_remote_address

from app.core.config import settings
from app.routes import documents, search, filters
from app.services.chroma_service import chroma_service

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)

limiter = Limiter(key_func=get_remote_address, storage_uri=settings.REDIS_URL)

app = FastAPI(
    title="Study Buddy API",
    root_path="/api"
)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(documents.router, prefix="/documents", tags=["Documents"])
app.include_router(search.router, prefix="/search", tags=["Search"])
app.include_router(filters.router, prefix="/filters", tags=["filters"])

@app.get("/")
def read_root():
    return {"message": "Study Buddy API is running!"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}

@app.get("/chroma/collections")
def list_collections():
    """List all ChromaDB collections"""
    collections = chroma_service.client.list_collections()
    return {"collections": [col.name for col in collections]}


@app.get("/chroma/count")
def collection_count():
    """Get document count in the documents collection"""
    count = chroma_service.collection.count()
    return {"collection": "documents", "count": count}


@app.get("/chroma/peek")
def collection_peek():
    """Preview documents in the collection"""
    results = chroma_service.collection.peek()
    return {
        "ids": results.get("ids", []),
        "documents": results.get("documents", []),
        "metadatas": results.get("metadatas", [])
    }

@app.delete("/chroma/{document_id}")
def delete_from_chroma(document_id: int):
    """Löscht ein Dokument aus ChromaDB anhand der document_id"""
    try:
        chroma_id = f"doc_{document_id}"
        chroma_service.delete_document(chroma_id)
        return {"message": f"Document {chroma_id} deleted from ChromaDB"}
    except Exception as e:
        return {"error": str(e)}