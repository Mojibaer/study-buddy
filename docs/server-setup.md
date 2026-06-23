# Server Setup

## Overview

Study Buddy runs on a Strato VPS. Backend, frontend, and all infrastructure
(PostgreSQL, Redis, Weaviate, MinIO) run as Docker containers behind Nginx.
Images are built in CI and pulled from ghcr.io — never built on the server. See
[ADR-0004](adr/0004-server-deployment-and-cicd.md) for the full architecture.

## Server Layout

```
/home/studybuddy/
├── production/   # Production deployment (docker/server/prod)
├── staging/      # Staging deployment (docker/server/staging)
└── shared/       # Shared MinIO stack (docker/server/minio)
```

## Infrastructure Services

PostgreSQL, Redis, and Weaviate run per environment via Docker Compose. MinIO is a
single shared stack across production and staging. See [docker/server/](../docker/server/)
for the compose files.

```bash
# PostgreSQL, Redis, Weaviate
docker compose -f docker/server/prod/docker-compose.yml up -d

# MinIO (shared object storage)
docker compose -f docker/server/minio/docker-compose.yml up -d
```

## Secrets

All secrets are managed via [Infisical](https://infisical.com/). The backend reads secrets at runtime via the Infisical CLI or SDK. Contact a maintainer for project access.

## Deployment

Deployments are triggered automatically via GitHub Actions:

- **Push to `main`** → deploys to Staging
- **GitHub Release (published)** → deploys to Production

To release to Production: create a tag on `main` and publish a GitHub Release from it.

Required GitHub Secrets:

| Secret | Description |
|---|---|
| `SERVER_HOST` | Server IP or hostname |
| `SERVER_USER` | SSH user |
| `SERVER_SSH_KEY` | Private SSH key for deployment |

## Containers

All app and infra services run as Docker containers. Production containers:
`studybuddy-backend`, `studybuddy-frontend`, `studybuddy-postgres`,
`studybuddy-redis`, `studybuddy-weaviate`; staging mirrors them with a
`studybuddy-staging-` prefix. MinIO runs as the shared `studybuddy-minio`.

```bash
# View logs (run from the env's compose dir, e.g. /home/studybuddy/production/docker/server/prod)
docker compose logs -f backend
docker compose logs -f frontend

# Restart manually
docker compose restart backend
```

## Nginx

Nginx acts as a reverse proxy, routing `/api` to the backend and `/` to the frontend. SSL is handled by Certbot.

## Firewall

```bash
sudo ufw status
# 22/tcp   — SSH
# 80/tcp   — HTTP (redirects to HTTPS)
# 443/tcp  — HTTPS
```
