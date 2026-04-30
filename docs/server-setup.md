# Server Setup

## Overview

Study Buddy runs on a Strato VPS. Backend and frontend are deployed as systemd services behind Nginx. Infrastructure services (PostgreSQL, Redis, Weaviate, MinIO) run as Docker containers.

## Server Layout

```
/home/studybuddy/
├── live/       # Production deployment
│   ├── backend/
│   └── frontend/
└── staging/    # Staging deployment
    ├── backend/
    └── frontend/
```

## Infrastructure Services

PostgreSQL, Redis, Weaviate, and MinIO run via Docker Compose. See [docker/server/](../docker/server/) for the compose files.

```bash
# Start all infrastructure services
docker compose -f docker/server/prod/docker-compose.yml up -d
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

## Systemd Services

| Service | Description |
|---|---|
| `studybuddy-backend` | FastAPI backend — Production |
| `studybuddy-frontend` | Next.js frontend — Production |
| `studybuddy-staging-backend` | FastAPI backend — Staging |
| `studybuddy-staging-frontend` | Next.js frontend — Staging |

```bash
# View logs
sudo journalctl -u studybuddy-backend -f
sudo journalctl -u studybuddy-frontend -f

# Restart manually
sudo systemctl restart studybuddy-backend
sudo systemctl restart studybuddy-frontend
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
