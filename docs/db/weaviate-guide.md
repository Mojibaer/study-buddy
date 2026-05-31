# Weaviate Guide

## Overview

Weaviate stores document embeddings for semantic search — finding documents by meaning, not just keywords. It runs as a "dumb" vector store: the backend computes the embeddings and passes the vector to Weaviate (`vectorizer=none`). See [ADR-0002](../adr/0002-weaviate-voyage-embedding-stack.md) for the full design.

**What it stores (per object):**
- The embedding vector (computed by the backend)
- `document_id` — link back to the PostgreSQL row
- `text` — a short snippet (≤ 500 chars) for search-result previews

**What it doesn't store:**
- File metadata, categories/subjects/semesters → PostgreSQL (resolved there first, then used to filter the vector search)
- File content → MinIO

**Embedding providers** (selected via `EMBEDDING_PROVIDER`):

| Provider | Model | Dim | Where |
|---|---|---|---|
| `fastembed` (default) | `paraphrase-multilingual-MiniLM-L12-v2` | 384 | offline, ONNX — no API key |
| `voyage` | `voyage-4-large` | 2048 | Voyage API — needs `VOYAGE_API_KEY` |

Each provider gets its own collection: `Documents_fastembed`, `Documents_voyage`.

## How It Works

1. Document uploaded → text extracted
2. Backend embeds the text (`embed`, document mode)
3. Vector + `document_id` + snippet inserted into Weaviate under a deterministic UUID (`uuid5(NAMESPACE, document_id)`)
4. Search query → embedded (`embed_query`, query mode) → `near_vector` finds matches; metadata filters resolve to `document_id`s in PostgreSQL first and constrain the search
5. If embedding or insert fails, the document still lands in PostgreSQL/MinIO with `vectorized_at = NULL` — `POST /weaviate/reindex` drains that backlog later

## Admin / Debug Endpoints

The `/weaviate/*` endpoints (admin-only) are useful for inspection and repair. Available under `http://localhost:8001/docs`:

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/weaviate/collections` | List all Weaviate collections |
| `GET` | `/weaviate/count` | Object count in the active provider's collection |
| `DELETE` | `/weaviate/{document_id}` | Remove a single vector (PostgreSQL/MinIO untouched) |
| `POST` | `/weaviate/reindex` | Re-embed the `vectorized_at IS NULL` backlog |

## Useful Commands

For deeper debugging with the `weaviate-client v4` Python SDK:

```python
import weaviate

client = weaviate.connect_to_custom(
    http_host="localhost", http_port=8100, http_secure=False,
    grpc_host="localhost", grpc_port=50051, grpc_secure=False,
)

# List collections
client.collections.list_all().keys()

# Count objects in a collection
col = client.collections.get("Documents_fastembed")
col.aggregate.over_all(total_count=True).total_count

# Fetch a few objects
for o in col.query.fetch_objects(limit=5).objects:
    print(o.uuid, o.properties)

# Delete a single object (deterministic UUID from document_id)
import uuid
ns = uuid.UUID("6f3b2e4a-3c1d-4d4e-9b3a-5e8f1c2a7d10")
col.data.delete_by_id(str(uuid.uuid5(ns, "42")))

client.close()
```

Weaviate official docs: https://weaviate.io/developers/weaviate

## Location

Self-hosted Weaviate `1.30.2`. Locally it runs via Docker Compose on ports `8100` (REST) and `50051` (gRPC) with `DEFAULT_VECTORIZER_MODULE=none`. In staging/production it runs behind API-key auth (`WEAVIATE_API_KEY`).
