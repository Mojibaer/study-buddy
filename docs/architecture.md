# Architecture Overview

Study Buddy follows a service-oriented architecture with a clear separation between frontend, backend, and infrastructure services.

## Services

```
Browser
  │
  ▼
Nginx (Reverse Proxy)
  ├── /          → Next.js Frontend  (port 3000)
  └── /api       → FastAPI Backend   (port 8001)
                      │
                      ├── PostgreSQL 17   — users, documents, metadata
                      ├── Redis 7         — JWT denylist, email verification tokens
                      ├── Weaviate 1.30   — semantic search and document embeddings
                      └── MinIO           — binary file storage (S3-compatible)
```

> **Note:** The services were chosen with learning and transparency in mind — each concern is handled by a dedicated, well-documented open-source tool. Depending on your needs, parts of this stack can be replaced: e.g. PostgreSQL + Redis + file storage could be consolidated with [Supabase](https://supabase.com/).

## Request Flow

1. The browser communicates exclusively through Nginx
2. Frontend requests to `/api/*` are proxied to the FastAPI backend
3. On upload, the backend stores the file binary in MinIO, metadata in PostgreSQL, and embeddings in Weaviate
4. On search, the backend queries Weaviate for semantic matches, then enriches results with metadata from PostgreSQL

## Authentication Flow

1. `POST /api/auth/register` — user submits email, a verification token is stored in Redis
2. `POST /api/auth/setup` — user consumes the token, sets username and password
3. `POST /api/auth/login` — returns a short-lived JWT access token and a long-lived refresh token
4. Access tokens are verified on every protected request; revoked tokens are tracked in the Redis denylist
5. `POST /api/auth/refresh` — rotates the refresh token and issues a new access token

## Local Development

In local development, Nginx is not used. Frontend and backend run directly on their respective ports, with infrastructure services (PostgreSQL, Redis, Weaviate) provided via Docker Compose.

Local file uploads use a shared remote MinIO instance with a dedicated development bucket — no local MinIO setup required.

## Secrets Management

For staging and production, secrets (database credentials, JWT keys, API tokens, etc.) are managed via [Infisical](https://infisical.com/). For local development, a `.env` file is used — see [docs/environment-setup-guide.md](environment-setup-guide.md) for the required variables.
