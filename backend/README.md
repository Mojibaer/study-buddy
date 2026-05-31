# Study Buddy — Backend

FastAPI backend for document management, semantic search, and JWT authentication.

## Prerequisites

- [Python](https://www.python.org/downloads/) >= 3.13
- [uv](https://docs.astral.sh/uv/getting-started/installation/) (package manager)
- GNU Make (the commands below run via Make targets)
- `libmagic` (system library for MIME-type detection on document upload)
- `openssl` (for generating `SECRET_KEY`)
- Infrastructure running via Docker Compose — see [docker/local/](../docker/local/)

OS-specific install commands for `make`, `libmagic`, and `openssl` are in the [Local Testing Guide](../docs/local-testing-guide.md#prerequisites).

## Setup

```bash
cd backend

# Install dependencies
uv sync

# Copy and configure environment variables
cp .env-example .env
```

Edit `.env` with your credentials — see the [Local Testing Guide](../docs/local-testing-guide.md) for details (including generating `SECRET_KEY` and creating the first admin).

## Running

```bash
make dev        # Start with auto-reload (development)
make run-prod   # Start with Gunicorn (production)
```

The API runs on `http://localhost:8001`  
Swagger UI: `http://localhost:8001/docs`

## Database Migrations

```bash
# Apply all migrations
uv run alembic upgrade head

# Create a new migration after model changes
uv run alembic revision --autogenerate -m "description"
```

## First Admin

Create the first admin user (reads `ADMIN_*` from `.env`, idempotent):

```bash
make create-admin
```

## Tech Stack

- **FastAPI** — Async REST API framework
- **SQLAlchemy 2** + **Alembic** — ORM and migrations
- **PostgreSQL 17** — Primary database
- **Redis 7** — JWT denylist and token caching
- **Weaviate 1.30** — Semantic search and document embeddings
- **MinIO** — S3-compatible file storage
- **PyJWT** + **Argon2** — Authentication and password hashing
- **Uvicorn** — ASGI server
