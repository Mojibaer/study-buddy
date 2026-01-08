from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import documents, search, filters
from app.services.chroma_service import chroma_service

app = FastAPI(title="Study Buddy API")

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