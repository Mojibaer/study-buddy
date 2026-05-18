# Local Testing Guide

How to run Study Buddy end-to-end on your machine — including the JWT auth flow with email verification.

## Prerequisites

- Docker + Docker Compose
- [uv](https://docs.astral.sh/uv/) (backend package manager)
- [Bun](https://bun.com/) (frontend package manager)
- `openssl` (for generating `SECRET_KEY`)

## 1. Environment Files

### Backend

```bash
cp backend/.env-example backend/.env
```

Generate a real `SECRET_KEY`:

```bash
openssl rand -hex 32
```

Paste the output into `backend/.env` as `SECRET_KEY=...`. The default `DATABASE_URL` already points at the local Postgres container — change only if you want to hit staging.

### Frontend

`frontend/.env.local` already exists with `NEXT_PUBLIC_API_URL=http://localhost:8001`. No changes needed for local dev.

### Docker (local infrastructure)

```bash
cp docker/local/.env-example docker/local/.env
```

The defaults work as-is.

## 2. Infrastructure

Start Postgres, Redis, Weaviate, and Mailpit:

```bash
cd backend
make db-up
```

`db-up` runs `docker compose up -d` on the local compose file. Verify everything is healthy:

```bash
docker ps
```

## 3. Backend

```bash
cd backend
make install            # uv sync — installs dependencies
uv run alembic upgrade head   # apply database migrations
make dev                # uvicorn on port 8001 with auto-reload
```

Verify:

```bash
curl http://localhost:8001/health
# {"status":"healthy"}
```

## 4. Frontend

In a new terminal:

```bash
cd frontend
bun install
bun dev                 # Next.js on port 3000
```

## 5. Service URLs

| Service | URL |
|---|---|
| Frontend | http://localhost:3000 |
| Backend | http://localhost:8001 |
| Backend OpenAPI | http://localhost:8001/docs |
| Mailpit UI | http://localhost:8025 |
| Postgres | `localhost:5432` |
| Redis | `localhost:6379` |
| Weaviate | http://localhost:8100 |

## 6. End-to-End Auth Flow

1. Open http://localhost:3000/register
2. Enter an `@edu.fh-joanneum.at` address (any address works locally — Mailpit catches it)
3. Open http://localhost:8025 — the verify email is there
4. Click **"Konto einrichten"** (or "Set up account") in the email
5. Enter username + password (min 12 chars) → redirected to home
6. Header avatar shows your initials → click → see role + **Logout**

## 7. Common Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| Backend fails to start with `SECRET_KEY must be at least 32 characters` | `.env` placeholder still in place | Generate with `openssl rand -hex 32` |
| Frontend gets CORS errors on `/auth/refresh` | Backend not running or wrong port | Check `make dev` is up on 8001 |
| No email arrives in Mailpit | Mailpit container down | `docker ps` — restart with `make db-up` |
| Login succeeds but `/me` returns 401 | Stale cookie from previous run | Clear cookies for `localhost:8001` |
| Database errors after pulling code | New migrations not applied | `uv run alembic upgrade head` |

## 8. Useful Make Targets

```bash
make dev          # start backend with auto-reload (port 8001)
make db-up        # start local docker services
make db-down      # stop local docker services
make db-reset     # destroy volumes and recreate everything
make test         # smoke-check that packages import and /health responds
make clean        # remove __pycache__ etc.
```
