from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import documents, search
import os

os.makedirs("./uploads", exist_ok=True)

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

@app.get("/")
def read_root():
    return {"message": "Study Buddy API is running!"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}

@app.get("/test-chroma")
def test_chroma():
    """Test ChromaDB with sample documents"""

    samples = [
        {
            "id": "test-1",
            "text": "Python ist eine interpretierte Programmiersprache mit dynamischer Typisierung.",
            "metadata": {"category": "programming", "subject": "Python"}
        },
        {
            "id": "test-2",
            "text": "FastAPI ist ein modernes Web-Framework für Python APIs.",
            "metadata": {"category": "programming", "subject": "FastAPI"}
        },
        {
            "id": "test-3",
            "text": "Algorithmen und Datenstrukturen sind fundamental für Informatik.",
            "metadata": {"category": "theory", "subject": "Algorithms"}
        }
    ]

    for sample in samples:
        chroma_service.add_document(
            doc_id=sample["id"],
            text=sample["text"],
            metadata=sample["metadata"]
        )

    results = chroma_service.search("Python Framework")

    return {
        "message": "Test data added",
        "search_results": results
    }