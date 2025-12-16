## Overview

ChromaDB stores document embeddings for semantic search - finding documents by meaning, not just keywords.

**What it stores:**
- Text embeddings (vector representations)
- Extracted document text
- Metadata for filtering (document_id, filename, category, subject, semester)

**What it doesn't store:**
- File metadata → PostgreSQL
- File content → MinIO

**Embedding Model:**
- Model: `all-MiniLM-L6-v2` (ChromaDB default)
- Dimensions: 384
- Purpose: Converts text to vectors for similarity comparison
- Languages: Works with German and English

## How It Works

1. Document uploaded → text extracted
2. Text converted to embedding vector (384 dimensions)
3. Vector stored with metadata in ChromaDB
4. Search query → converted to vector → cosine similarity finds matches

## Chroma Endpoints

Can be used under `localhost:8001/docs` for debugging.

## Useful Commands

For more detail debugging may this commands will help you.

```python
import chromadb

# Connect
client = chromadb.HttpClient(
            host=os.getenv("CHROMA_HOST", "localhost"),
            port="8100"
        )
collection = client.get_collection("<collection_name>")

# Count documents
collection.count()

# Get all documents
collection.get()

# Get specific document
collection.get(ids=["chroma_uuid"])

# Get with filters
collection.get(where={"category": "Vorlesung"})

# Search by text
collection.query(query_texts=["integration"], n_results=5)

# Delete single document
collection.delete(ids=["chroma_uuid"])

# Delete all documents
collection.delete(where={})

# Delete entire collection
client.delete_collection("<collection_name>")
```

Chroma official docs: https://cookbook.chromadb.dev/core/

## Location

### ChromaDB as Service

Vector database for semantic search. The data will be stored on server for both development and production. Be sure to use `test-document` collection for development in .env file.

**Estimated storage:**
- ~1000 documents ≈ 30-50 MB
