import asyncio
import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

from app.core.limiter import limiter
from app.routes import auth, documents, search, filters, admin_documents, admin_users, admin_structure
from app.services.chroma_service import chroma_service
from app.services.embedding import build_provider
from app.services.weaviate_service import WeaviateService

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Provider construction may download a model (FastEmbed) and connect()
    # / bootstrap_collection() block on network I/O — keep them off the loop.
    provider = await asyncio.to_thread(build_provider)
    weaviate = WeaviateService()
    await asyncio.to_thread(weaviate.connect)
    await asyncio.to_thread(
        weaviate.bootstrap_collection, provider.name, provider.dimension
    )

    app.state.embedding_provider = provider
    app.state.weaviate = weaviate
    try:
        yield
    finally:
        await asyncio.to_thread(weaviate.close)


app = FastAPI(
    title="Study Buddy API",
    root_path="/api",
    lifespan=lifespan,
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

app.include_router(auth.router, prefix="/auth", tags=["Auth"])
app.include_router(documents.router, prefix="/documents", tags=["Documents"])
app.include_router(search.router, prefix="/search", tags=["Search"])
app.include_router(filters.router, prefix="/filters", tags=["filters"])
app.include_router(admin_documents.router, prefix="/admin/documents", tags=["Admin Documents"])
app.include_router(admin_users.router, prefix="/admin/users", tags=["Admin Users"])
app.include_router(admin_structure.router, prefix="/admin/structure", tags=["Admin Structure"])

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