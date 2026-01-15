# StudyBuddy - Docker Services

## Overview

The project uses Docker Compose to manage infrastructure services. Services are organized by environment:

```
docker/
├── local/           # Local development (your machine)
│   ├── .env.example
│   └── docker-compose.yml
└── server/          # Server deployment
    ├── dev/         # Development environment
    │   ├── .env.example
    │   └── docker-compose.yml
    ├── prod/        # Production environment
    │   ├── .env.example
    │   └── docker-compose.yml
    └── minio/       # Shared MinIO instance
        ├── .env.example
        └── docker-compose.yml
```

## Services

| Service | Purpose | Local Port | Dev Port | Prod Port |
|---------|---------|------------|----------|-----------|
| PostgreSQL | Database | 5432 | 5432 | 5433 |
| ChromaDB | Vector embeddings | 8100 | 8100 | 8101 |
| MinIO API | Object storage | 9000 | 9000 | 9000 |
| MinIO Console | Storage UI | 9001 | 9001 | 9001 |

## Local Development

For development on your local machine.

### Setup

```bash
cd docker/local
cp .env.example .env
# Edit .env
```

### Commands

```bash
# Start all services
docker compose up -d

# Stop all services
docker compose down

# View logs
docker compose logs -f

# View specific service logs
docker compose logs -f postgres

# Reset (delete all data)
docker compose down -v
```

### Connection Details

| Service | Host | Port | Credentials |
|---------|------|------|-------------|
| PostgreSQL | localhost | 5432 | See .env |
| ChromaDB | localhost | 8100 | - |
| MinIO API | localhost | 9000 | See .env |
| MinIO Console | localhost | 9001 | See .env |

## Server Deployment

The server runs separate Dev and Prod environments with a shared MinIO instance.

### Architecture

```
┌─────────────────────────────────────────────────────┐
│                      Server                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  │
│  │     Dev     │  │    Prod     │  │    MinIO    │  │
│  │  PostgreSQL │  │  PostgreSQL │  │  (shared)   │  │
│  │  ChromaDB   │  │  ChromaDB   │  │             │  │
│  │  Port 5432  │  │  Port 5433  │  │  Buckets:   │  │
│  │  Port 8100  │  │  Port 8101  │  │  - dev      │  │
│  └─────────────┘  └─────────────┘  │  - prod     │  │
│                                    └─────────────┘  │
└─────────────────────────────────────────────────────┘
```

### Initial Setup

```bash
# MinIO (run once, shared between environments)
cd ~/study-buddy/docker/server/minio
cp .env.example .env
vim .env  # Set credentials
docker compose up -d

# Dev environment
cd ~/study-buddy/docker/server/dev
cp .env.example .env
vim .env  # Set credentials
docker compose up -d

# Prod environment
cd ~/study-buddy/docker/server/prod
cp .env.example .env
nano .env  # Set credentials
docker compose up -d
```

### MinIO Bucket Setup

MinIO has buckets for each environment dev and prod:

1. Open MinIO Console: `https://minio.mojiverse.dev`
2. Login with credentials from `.env`

### Managing Services

#### Dev Environment

```bash
cd ~/study-buddy/docker/server/dev

# Start
docker compose up -d

# Stop
docker compose down

# Logs
docker compose logs -f

# Reset (WARNING: deletes all dev data)
docker compose down -v
```

#### Prod Environment

```bash
cd ~/study-buddy/docker/server/prod

# Start
docker compose up -d

# Stop
docker compose down

# Logs
docker compose logs -f

# Reset (WARNING: deletes all prod data)
docker compose down -v
```

#### MinIO

```bash
cd ~/study-buddy/docker/server/minio

# Start
docker compose up -d

# Stop
docker compose down

# Logs
docker compose logs -f
```

### Server Connection Details

#### Dev Environment

| Service | Host | Port |
|---------|------|------|
| PostgreSQL | localhost | 5432 |
| ChromaDB | localhost | 8100 |
| MinIO | localhost | 9000 |

#### Prod Environment

| Service | Host | Port |
|---------|------|------|
| PostgreSQL | localhost | 5433 |
| ChromaDB | localhost | 8101 |
| MinIO | localhost | 9000 |

## Environment Variables

### PostgreSQL

| Variable | Description |
|----------|-------------|
| `POSTGRES_DB` | Database name |
| `POSTGRES_USER` | Database user |
| `POSTGRES_PASSWORD` | Database password |

### MinIO

| Variable | Description |
|----------|-------------|
| `MINIO_ROOT_USER` | Admin username |
| `MINIO_ROOT_PASSWORD` | Admin password |

## Health Checks

All services include health checks. View status:

```bash
docker compose ps
```

Healthy output:

```
NAME                        STATUS
studybuddy-local-postgres   Up (healthy)
studybuddy-local-chromadb   Up
studybuddy-local-minio      Up (healthy)
```

## Troubleshooting

### Service won't start

```bash
# Check logs
docker compose logs <service-name>

# Check if port is in use
sudo lsof -i :<port>
```

### Database connection refused

```bash
# Verify PostgreSQL is running
docker compose ps postgres

# Check PostgreSQL logs
docker compose logs postgres
```

### ChromaDB not responding

```bash
# Restart ChromaDB
docker compose restart chromadb

# Check logs
docker compose logs chromadb
```

### MinIO bucket not accessible

1. Verify MinIO is running: `docker compose ps`
2. Check bucket exists in MinIO Console
3. Verify bucket policy allows access

### Reset everything

```bash
# Stop and remove all containers, networks, and volumes
docker compose down -v

# Start fresh
docker compose up -d
```

## Backup & Restore

### PostgreSQL

```bash
# Backup
docker exec studybuddy-prod-postgres pg_dump -U <user> <database> > backup.sql

# Restore
cat backup.sql | docker exec -i studybuddy-prod-postgres psql -U <user> <database>
```

### MinIO

MinIO data is stored in Docker volumes. For backup:

```bash
# Find volume location
docker volume inspect studybuddy-minio_minio_data
```