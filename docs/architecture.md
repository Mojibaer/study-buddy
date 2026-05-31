# Architecture Overview

Study Buddy follows a service-oriented architecture with a clear separation between frontend, backend, and infrastructure services.

## Services

| Service | Role |
|---|---|
| **Next.js frontend** (port 3000) | Browser-facing UI |
| **FastAPI backend** (port 8001) | REST API, auth, business logic |
| **PostgreSQL 17** | Users, documents, metadata — source of truth |
| **Redis 7** | JWT denylist, email verification tokens |
| **Weaviate 1.30** | Semantic search and document embeddings |
| **MinIO** | Binary file storage (S3-compatible) |

In production, a reverse proxy serves the frontend at `/` and proxies `/api/*` to the backend. In local development there is no proxy — frontend and backend run directly on their respective ports.

> **Note:** The services were chosen with learning and transparency in mind — each concern is handled by a dedicated, well-documented open-source tool. Depending on your needs, parts of this stack can be replaced: e.g. PostgreSQL + Redis + file storage could be consolidated with [Supabase](https://supabase.com/).

## Request Flow

1. Frontend requests to the API are routed to the FastAPI backend (via the `/api` proxy in production, directly on port 8001 in local dev)
2. On upload, the backend stores the file binary in MinIO, metadata in PostgreSQL, and — best-effort — embeddings in Weaviate
3. On search, the backend resolves any metadata filters in PostgreSQL first, then queries Weaviate for semantic matches and enriches the results with metadata

## Authentication Flow

1. `POST /auth/register` — user submits email, a verification token is stored in Redis
2. `POST /auth/setup` — user consumes the token, sets username and password
3. `POST /auth/login` — returns a short-lived JWT access token and a long-lived refresh token
4. Access tokens are verified on every protected request; revoked tokens are tracked in the Redis denylist
5. `POST /auth/refresh` — rotates the refresh token and issues a new access token

For the token storage strategy and its trade-offs, see [ADR-0001](adr/0001-jwt-storage-strategy.md).

## Local Development

Frontend and backend run directly on their respective ports; infrastructure services (PostgreSQL, Redis, Weaviate, MinIO, Mailpit) are provided via Docker Compose (`docker/local/docker-compose.yml`).

See the [Local Testing Guide](local-testing-guide.md) for the full end-to-end setup.

## Secrets Management

For staging and production, secrets (database credentials, JWT keys, API tokens, etc.) are managed via [Infisical](https://infisical.com/). For local development, `.env` files are used — see the [Local Testing Guide](local-testing-guide.md) for the required variables.
