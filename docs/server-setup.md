# Server Setup

## Overview

Study Buddy infrastructure runs on a Strato server with Docker containers for PostgreSQL 17 and MinIO (S3-compatible object storage).

## Server Configuration

### Location
```
~/docker
├── docker-compose.yml
├── .env
```

### Firewall
```bash
sudo ufw status
# 22/tcp   (SSH)
# 5432/tcp (PostgreSQL)
# 9000/tcp (MinIO API)
# 9001/tcp (MinIO Console)
```

## Docker Commands
```bash
cd ~/docker/studybuddy

# Start all services
docker compose up -d

# Stop all services
docker compose down

# View logs
docker compose logs -f           # All services
docker compose logs -f postgres  # PostgreSQL only
docker compose logs -f minio     # MinIO only

# Container status
docker ps

# PostgreSQL shell
docker exec -it studybuddy-postgres psql -U studybuddy -d studybuddy
```

## Services

### PostgreSQL

Database for document metadata.

**Remote connection (from local machine):**
```env
DATABASE_URL=postgresql://studybuddy:<password>@85.215.241.173:5432/studybuddy
```

**Local connection (on server or local Docker):**
```env
DATABASE_URL=postgresql://studybuddy:<password>@localhost:5432/studybuddy
```

### MinIO

Object storage for uploaded documents.

**Console:** `http://85.215.241.173:9001`

**Buckets:**
- `documents` – Production, validated files only
- `test-documents` – For development and testing

**Remote connection (from local machine):**
```env
MINIO_ENDPOINT=85.215.241.173:9000
MINIO_ACCESS_KEY=<MINIO_ROOT_USER from .env>
MINIO_SECRET_KEY=<MINIO_ROOT_PASSWORD from .env>
MINIO_BUCKET=test-documents
```

**Local connection (on server):**
```env
MINIO_ENDPOINT=localhost:9000
MINIO_ACCESS_KEY=<MINIO_ROOT_USER from .env>
MINIO_SECRET_KEY=<MINIO_ROOT_PASSWORD from .env>
MINIO_BUCKET=test-documents
```

## Credentials

Stored in `.env` on the server:
```bash
cd ~/docker
cat .env
```

Contains: `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD`, `MINIO_ROOT_USER`, `MINIO_ROOT_PASSWORD`

## Development Workflow

- **Remote development:** Connect to server services via IP, use `test-documents` bucket
- **Local development:** Run own Docker containers or connect to server
- **Production:** Use `documents` bucket