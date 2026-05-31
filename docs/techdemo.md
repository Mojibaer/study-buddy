# Tech Demo — Authentication & REST (Weaviate Migration)

This document describes the parts of **Study Buddy** that we built for the
*Web Service Development* tech demo. Study Buddy is our startup project (FH
Joanneum, SS 2026); for the tech demo we picked two slices of it:

1. The **full authentication & session implementation** (JWT, refresh tokens,
   email verification, logout/denylist).
2. The **REST API** that grew out of the **Weaviate migration** — document
   upload/listing/detail/delete, semantic search, and the Weaviate admin
   endpoints.

The authentication builds on the JWT fundamentals from the lecture (form-based
login, `Authorization: Bearer` on every request) and adds the features we needed
for a real product — refresh-token rotation, a server-side logout denylist, and
email-verified onboarding.

> **Scope note.** The pure admin-area endpoints (user management, study-structure
> CRUD, admin document management under `/admin/*`) are **not** part of the tech
> demo. The **Weaviate admin endpoints** (`/weaviate/*`) **are** part of it —
> they were built during the migration.

**Team:** Hassan Erfani · Alexander Mandl · Alexander Gherman · Andreas Baldauf

---

## How to set up & run

Local setup (Docker infra, backend, frontend, admin bootstrap, end-to-end auth
flow) is documented in **[local-testing-guide.md](local-testing-guide.md)**.

Once running, the interactive API docs (Swagger UI) are at
`http://localhost:8001/docs`.

> **Note.** In its current state the project is configured for **local testing
> only**. Staging and production are not set up — the secrets, deployment
> targets, and managed services described in the architecture/server docs below
> are not provisioned. Everything in this tech demo is meant to be run locally.

## Design decisions (ADRs)

- **[ADR-0001 — JWT Storage Strategy](adr/0001-jwt-storage-strategy.md)** —
  where the tokens live (refresh in an HttpOnly cookie, access token in memory)
  and the XSS/CSRF trade-offs behind it.
- **[ADR-0002 — Weaviate / Voyage Embedding Stack](adr/0002-weaviate-voyage-embedding-stack.md)** —
  the vector store, embedding providers, deterministic UUIDs, and best-effort
  vectorization that shaped the REST endpoints below.

---

## 1. Authentication & Session Handling

Form-based login that issues a JWT: after login the client sends
`Authorization: Bearer <token>` on every request. On top of that baseline we
added refresh-token rotation, a Redis-backed logout denylist, and an
email-verification onboarding flow.

### Endpoints (`/auth`)

| Method | Path | Purpose | Success | Notable errors |
|---|---|---|---|---|
| `POST` | `/auth/register` | Start registration, send verify email | `201` | `409` email exists |
| `POST` | `/auth/setup` | Set username + password from verify token | `200` + token | `400` invalid/expired token, `409` already set up / username taken |
| `POST` | `/auth/login` | Exchange credentials for tokens | `200` + token | `401` wrong credentials, `403` inactive |
| `POST` | `/auth/refresh` | Rotate refresh cookie → new access token | `200` + token | `401` missing/expired |
| `POST` | `/auth/logout` | Denylist access JTI + revoke refresh tokens | `204` | — |
| `GET` | `/auth/me` | Current user | `200` | `401` |

### How it works

- **The token carries no sensitive data** — only `sub` (user id), `iat`, `exp`,
  `jti`, `iss`, `aud`. No role, no PII; the role is read fresh from the DB on
  every request, so a deactivated user loses access immediately.
- **Token validation** — signature, `aud`, `iss` and a `type=access` check on
  every request (`decode_token_payload`), plus a Redis **JTI denylist** lookup.
- **Logout invalidates server-side** — the access token's `jti` is denylisted in
  Redis for its remaining TTL, and all refresh tokens are revoked in the DB.
- **Token lifetimes** — access 30 min, refresh 7 days with rotation on each use.
- **Unpredictable tokens** — the refresh token is `secrets.token_urlsafe(64)`,
  the `jti` is a UUID v4. The raw refresh token is never stored — only its
  SHA-256 hash.
- **Password hashing** — **Argon2** with automatic per-password salting.
- **Authorization in the backend** — endpoints are gated by dependencies, not by
  the frontend.
- **Cookie hardening** — refresh token in an `HttpOnly` cookie; `Secure` +
  `SameSite=strict` in production, `Secure=false` + `SameSite=lax` only on local
  HTTP `localhost`. See [ADR-0001](adr/0001-jwt-storage-strategy.md).
- **Brute-force protection** — SlowAPI rate limits on `register` / `setup` /
  `login` / `refresh`.

---

## 2. REST API from the Weaviate Migration

The migration moved semantic search from ChromaDB to Weaviate and reshaped the
document and search endpoints. They follow REST conventions — meaningful HTTP
methods, status codes that carry meaning, JSON/multipart request bodies, and the
`Authorization` header.

### Documents (`/documents`)

| Method | Path | Purpose | Success | Notable errors |
|---|---|---|---|---|
| `POST` | `/documents/upload` | Upload file → Postgres + MinIO + Weaviate | `200` | `400` bad type / content-mismatch, `413` too large |
| `GET` | `/documents/` | List documents (filter by category/subject/semester) | `200` | — |
| `GET` | `/documents/{id}` | Single document | `200` | `404` |
| `GET` | `/documents/{id}/download` | Presigned MinIO download URL | `200` | `404` |
| `DELETE` | `/documents/{id}` | Delete (uploader or admin) | `200` | `403` not allowed, `404` |

### Search (`/search`)

| Method | Path | Purpose | Success |
|---|---|---|---|
| `GET` | `/search/semantic` | Vector search via Weaviate `near_vector` | `200` |

Query params: `query` (required), optional `category_id` / `subject_id` /
`semester_id` pre-filter (resolved in Postgres first), `limit` (1–50). Results
carry a Weaviate-native **score** (0–1, higher = better) — not a legacy distance.

### Weaviate admin (`/weaviate`, all `require_admin`)

| Method | Path | Purpose | Success | Notable errors |
|---|---|---|---|---|
| `GET` | `/weaviate/collections` | List Weaviate collections | `200` | — |
| `GET` | `/weaviate/count` | Object count in the active provider collection | `200` | — |
| `DELETE` | `/weaviate/{document_id}` | Remove a vector (repair tool; Postgres/MinIO untouched) | `200` | `404` vector not found |
| `POST` | `/weaviate/reindex` | Drain the `vectorized_at IS NULL` backlog, oldest first | `200` | — |

### Notes on the design

- **HTTP methods map to intent** — `GET` reads, `POST` creates/actions, `DELETE`
  removes; status codes distinguish `400` bad input, `401` vs `403`
  (unauthenticated vs forbidden), `404`, `409` conflict, `413` payload too large.
- **Request bodies** — JSON for auth, `multipart/form-data` for the file upload.
- **Best-effort vectorization** — if embedding or Weaviate is down, the upload
  still succeeds (`vectorized_at` stays `NULL`) and `POST /weaviate/reindex`
  drains the backlog later. See [ADR-0002](adr/0002-weaviate-voyage-embedding-stack.md).

### Trying it with a REST client

Import the OpenAPI spec from `http://localhost:8001/openapi.json` into a REST
client like **Bruno**, or use **cURL**:

```bash
# Login (form-encoded) → access token
# Use single quotes around the password so the shell doesn't expand `!` and other special characters.
curl -X POST http://localhost:8001/auth/login \
  -H "Content-Type: application/x-www-form-urlencoded" \
  --data-urlencode "username=you@edu.fh-joanneum.at" \
  --data-urlencode 'password=your-password'

# Authenticated semantic search
curl -G http://localhost:8001/search/semantic \
  -H "Authorization: Bearer <access_token>" \
  --data-urlencode "query=sorting algorithms" | jq
```

---

## Further project documentation

The following documents describe the wider Study Buddy project beyond the tech
demo. They are provided as context — not all of it is part of what we built for
this demo.

- **[Architecture Overview](architecture.md)** — how the services (frontend,
  backend, PostgreSQL, Redis, Weaviate, MinIO) fit together and the request flow.
- **[ADR-0003 — Admin Area Architecture](adr/0003-admin-area-architecture.md)** —
  the admin endpoints and frontend structure (outside the tech-demo scope).
- **Database & storage guides** — [PostgreSQL](db/postgres-guide.md),
  [Alembic migrations](db/db-migration-alembic.md), [Weaviate](db/weaviate-guide.md),
  [MinIO](db/minio-storage.md).
- **[Server Setup](server-setup.md)** — the intended staging/production
  deployment (VPS, systemd, Nginx, Infisical). Not provisioned in the current
  state — see the note above.
