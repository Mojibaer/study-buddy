# PostgreSQL Server Setup

## Overview

PostgreSQL 17 runs in a Docker container on the Strato server.

## Server Configuration

### Location
```
~/docker/postgres/
├── docker-compose.yml
├── .env
```

### Firewall
Only SSH and PostgreSQL are allowed:
```bash
sudo ufw status
# 22/tcp   (SSH)
# 5432/tcp (PostgreSQL)
```

## Docker Commands
```bash
cd ~/docker/postgres

# Start container
docker compose up -d

# Stop container
docker compose down

# View logs
docker compose logs -f postgres

# Container status
docker ps

# PostgreSQL shell
docker exec -it studybuddy-postgres psql -U studybuddy -d studybuddy
```

## Connection

### Backend .env Configuration

For remote access (frontend development):
```env
DATABASE_URL=postgresql://studybuddy:<password>@85.215.241.173:5432/studybuddy
```

For local development (models development):
```env
DATABASE_URL=postgresql://studybuddy:studybuddy123@localhost:5432/studybuddy
```

## Development Workflow

- **Frontend development**: Use remote DB on server
- **Models development**: Use local Docker container

## Credentials

Credentials are stored in `.env` on the server:
```bash
cd ~/docker/postgres
cat .env
```