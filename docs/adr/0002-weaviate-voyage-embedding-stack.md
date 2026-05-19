# ADR-0002: Weaviate + Voyage Embedding Stack

**Status:** Accepted
**Date:** 2026-05-19
**Issues:** WAV-01, WAV-02

## Context

Study Buddy needs semantic search over user-uploaded documents. The stack must:

1. Run in production with a strong embedding model.
2. Be cloneable and runnable by an external contributor **without API keys**.
3. Stay portable between local, staging, and production — same code path, same data flow.
4. Be testable on a developer laptop without paid services or CI infrastructure.

The vector store is self-hosted Weaviate `1.30.2`. Embedding model selection, where the embedding happens, and how dev/prod stay consistent are the open questions.

## Decisions

### 1. Embedding lives in the backend, Weaviate is a dumb vector store

| | Backend embeds | Weaviate embeds |
|---|---|---|
| Provider switch | code change | container + module config change |
| Re-index on switch | possible without redeploy | per-environment migration |
| `voyage-4-large` | native (API call from backend) | needs `text2vec-voyageai` module |
| Local-vs-prod parity | same pipeline | different vectorizer modules |

→ Weaviate runs with `DEFAULT_VECTORIZER_MODULE=none`. The backend computes vectors and passes them to Weaviate as `vector=[...]`.

### 2. Provider switch via single env var

```
EMBEDDING_PROVIDER=voyage|fastembed   # default: fastembed
```

| Mode | Provider | Model | Dim | Where |
|---|---|---|---|---|
| Quickstart / external contributors | `fastembed` | `paraphrase-multilingual-MiniLM-L12-v2` | 384 | offline, ONNX |
| Local with Voyage key | `voyage` | `voyage-4-large` | 2048 | API |
| Staging / Production | `voyage` | `voyage-4-large` | 2048 | API (key via Infisical injection) |

Fail-fast on startup if `EMBEDDING_PROVIDER=voyage` but `VOYAGE_API_KEY` is empty.

### 3. One Weaviate collection per provider

Collections: `Documents_voyage`, `Documents_fastembed`.

Rationale: dimensions and embedding spaces differ. Switching providers without re-indexing would either fail or return garbage. Separate collections allow developers to flip `EMBEDDING_PROVIDER` and immediately work in the matching index.

### 4. Minimal Weaviate schema — Postgres is source of truth

```
class: Documents_{provider}
vectorizer: none
properties:
  - document_id: int    # link back to Postgres
  - text: text          # for snippet previews after search
```

Categories, subjects, semesters, filenames, tags are **not** duplicated into Weaviate. Filters resolve `category_id`/`subject_id`/`semester_id` in Postgres first, then constrain Weaviate's vector search by `document_id`. No cross-store drift.

### 5. Asymmetric query embeddings

The `EmbeddingProvider` protocol exposes both:

- `embed(text)` — for document indexing (Voyage: `input_type="document"`)
- `embed_query(text)` — for search queries (Voyage: `input_type="query"`)

FastEmbed/MiniLM is symmetric; its `embed_query` delegates to `embed`. Voyage's embedding space is trained asymmetrically — mixing modes hurts recall.

### 6. Transport: REST + gRPC

The `weaviate-client v4` connects to both ports:

| Port | Protocol | Used for |
|---|---|---|
| `8100 → 8080` | REST | schema operations, health checks |
| `50051` | gRPC | inserts, batch inserts, vector queries |

The client picks automatically; no per-call decision in app code. gRPC keeps insert/search hot paths off HTTP/1.1.

### 7. Async-safe startup

Lifespan (in `app/main.py`) runs three blocking calls — provider construction (may download a model), Weaviate connect, schema bootstrap — through `asyncio.to_thread()`. The event loop is never blocked on cold start, regardless of cache state or network latency.

### 8. Lifecycle via `app.state` + FastAPI dependencies

No module-level singletons. The lifespan constructs the provider and `WeaviateService`, stores both on `app.state`, and routes inject them via:

```python
from app.core.dependencies import get_weaviate, get_embedding_provider

provider: EmbeddingProvider = Depends(get_embedding_provider)
weaviate: WeaviateService   = Depends(get_weaviate)
```

This keeps construction explicit, makes tests trivial (no `cache_clear` rituals), and matches the rest of the project's DI style.

## Architecture

```
┌──────────────────────────────────────────────────────────────┐
│ FastAPI app                                                  │
│                                                              │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │ Lifespan (async)                                        │ │
│  │   build_provider()    ─── asyncio.to_thread             │ │
│  │   weaviate.connect()  ─── asyncio.to_thread             │ │
│  │   weaviate.bootstrap_collection(...) ── asyncio.to_thread│ │
│  │   app.state.embedding_provider / .weaviate              │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                              │
│  Routes ── Depends(get_embedding_provider, get_weaviate)     │
│                                                              │
└────────┬────────────────────────────────┬────────────────────┘
         │                                │
         │ embed() / embed_query()        │ REST + gRPC
         ▼                                ▼
   ┌──────────────┐               ┌──────────────────┐
   │ Voyage API   │               │ Weaviate         │
   │ (prod)       │               │ self-hosted      │
   │ or           │               │ vectorizer=none  │
   │ FastEmbed    │               │ Documents_{prov} │
   │ ONNX (local) │               └──────────────────┘
   └──────────────┘
                                  ┌──────────────────┐
                                  │ Postgres         │
                                  │ documents table  │
                                  │ filters, hydrate │
                                  └──────────────────┘
```

## Testing

| Suite | Scope | Requires Docker | Run with |
|---|---|---|---|
| Unit | factory switch, fail-fast, dimensions, embed output, `collection_name`, not-connected guard | no | `pytest -m "not integration"` |
| Integration | Weaviate connect, schema bootstrap, idempotency | yes (local compose) | `pytest` |
| Voyage e2e | dimension assertion for `voyage-4-large` | requires `VOYAGE_API_KEY` | auto-skipped when key missing |

FastEmbed is used in tests directly — no mocking. The ONNX model is small and deterministic. Weaviate integration tests hit the compose-local instance; the `@pytest.mark.integration` marker keeps them out of a `pytest -m "not integration"` run when CI is added later.

## Infra

### Local (`docker/local/docker-compose.yml`)

```yaml
weaviate:
  image: cr.weaviate.io/semitechnologies/weaviate:1.30.2
  ports: ["8100:8080", "50051:50051"]
  environment:
    AUTHENTICATION_ANONYMOUS_ACCESS_ENABLED: "true"
    DEFAULT_VECTORIZER_MODULE: "none"
    ENABLE_API_BASED_MODULES: "true"
  healthcheck:
    test: wget --spider http://localhost:8080/v1/.well-known/ready
```

### Staging / Production

Weaviate runs behind API-key auth (`WEAVIATE_API_KEY`). `VOYAGE_API_KEY` is injected from Infisical (`secrets.studybuddy.mojiverse.dev`) into the process environment — Pydantic settings consume it like any other env var; no SDK integration in code.

## Configuration

| Env var | Default | Purpose |
|---|---|---|
| `EMBEDDING_PROVIDER` | `fastembed` | provider switch |
| `VOYAGE_API_KEY` | _(unset)_ | required iff provider is `voyage` |
| `VOYAGE_MODEL` | `voyage-4-large` | `Literal[...]` — typos rejected at parse time |
| `FASTEMBED_MODEL` | `…/MiniLM-L12-v2` | 384-dim multilingual default |
| `WEAVIATE_HTTP_HOST` / `_PORT` / `_SECURE` | `localhost` / `8100` / `false` | REST endpoint |
| `WEAVIATE_GRPC_HOST` / `_PORT` / `_SECURE` | `localhost` / `50051` / `false` | gRPC endpoint |
| `WEAVIATE_API_KEY` | _(unset)_ | required in staging/production |

## Consequences

### Positive

- External contributors clone and run with zero API keys.
- Identical pipeline lives in dev, staging, prod — only `EMBEDDING_PROVIDER` differs.
- Voyage / FastEmbed live side by side with separate indexes; switching is instant.
- Postgres remains the single source of truth for document metadata; no cross-store drift.
- Async-safe startup; no event-loop stalls on cold cache.
- `Literal`-typed config rejects typos before any service code runs.

### Trade-offs

- The default 384-dim MiniLM produces noticeably lower-quality semantic results than `voyage-4-large` (2048-dim). External contributors evaluating retrieval quality must set `VOYAGE_API_KEY`.
- A model swap inside `FASTEMBED_MODEL` does not invalidate the existing `Documents_fastembed` collection. A future safeguard (dimension assertion or namespaced collection) is tracked outside Phase 1.
- The Weaviate-client v4 sync API is wrapped in `to_thread`. If hot-path latency becomes an issue, migrate to its async client.

## Out of scope (later phases)

- Document upload, semantic search, document delete, debug endpoints — Phase 2 (WAV-03/04/05/06).
- Removal of the previous ChromaDB integration (`chroma_service`, `reindex_chroma.py`, `chromadb` dependency, `CHROMA_*` env vars, `/chroma/*` routes) — Phase 3 (WAV-07).
- Infisical-driven secret injection for staging / production deployment.
