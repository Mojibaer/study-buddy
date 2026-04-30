# Study Buddy — Backend

FastAPI backend for document management, semantic search, and JWT authentication.

## Prerequisites

- [Python](https://www.python.org/downloads/) >= 3.13
- [uv](https://docs.astral.sh/uv/getting-started/installation/) (package manager)
- Infrastructure running via Docker Compose — see [docker/local/](../docker/local/)

## Setup

```bash
cd backend

# Install dependencies
uv sync

# Copy and configure environment variables
cp .env-example .env
```

Edit `.env` with your credentials — see [docs/environment-setup-guide.md](../docs/environment-setup-guide.md) for details.

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

## Tech Stack

- **FastAPI** — Async REST API framework
- **SQLAlchemy 2** + **Alembic** — ORM and migrations
- **PostgreSQL 17** — Primary database
- **Redis 7** — JWT denylist and token caching
- **Weaviate 1.30** — Semantic search and document embeddings
- **MinIO** — S3-compatible file storage
- **PyJWT** + **Argon2** — Authentication and password hashing
- **Uvicorn** — ASGI server
