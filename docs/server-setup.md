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
# 443      (SSL)
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
```
## Services

- **PostgreSQL**
- **MinIO**
- **ChromaDB** (not implemented yet but in planning)


## Credentials

Stored in `.env` on the server:
```bash
cd ~/docker
cat .env
```

Contains: `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD`, `MINIO_ROOT_USER`, `MINIO_ROOT_PASSWORD`, `MINIO_PUBLIC_URL`

## Development Workflow

- **Remote development:** Connect to server services via IP, use `test-documents` bucket
- **Local development:** Run own Docker containers or connect to server
- **Production:** Use `documents` bucket