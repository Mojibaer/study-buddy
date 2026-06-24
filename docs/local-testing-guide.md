# Local Testing Guide

How to run Study Buddy end-to-end on your machine — including the JWT auth flow with email verification.

There are two ways to run the stack:

- **[Option A — Docker (recommended)](#option-a--docker-recommended)** — everything runs in containers, including backend and frontend. No need to install `uv`, `Bun`, `Make`, or `libmagic` locally. This is the fastest way to get a working environment and the one we recommend for contributors who just want the app running.
- **[Option B — Native](#option-b--native)** — backend and frontend run directly on your machine with `uv` and `Bun`, only the infrastructure runs in Docker. Pick this if you work deep in the code and want the snappiest hot-reload (native file-watching beats bind-mounts on macOS/Windows).

Both options share the same environment files and produce the same [Service URLs](#service-urls) and [auth flow](#end-to-end-auth-flow).

---

## Option A — Docker (recommended)

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) >= 24 + Docker Compose
- `openssl` (for generating `SECRET_KEY`) — or any way to produce a 32+ character random string

That's it. Backend, frontend, and all infrastructure run in containers, so `uv`, `Bun`, `Make`, and `libmagic` are **not** required on your machine.

### 1. Environment file

```bash
cp docker/local/.env-example docker/local/.env
```

Generate a real `SECRET_KEY` (must be at least 32 characters) and paste it into `docker/local/.env`:

```bash
openssl rand -hex 32
```

The other defaults (Postgres, MinIO credentials) work as-is.

### 2. Start everything

```bash
cd docker/local
docker compose up -d --build
```

This builds the backend and frontend images and starts the full stack: Postgres, Redis, Weaviate, MinIO, Mailpit, **plus** the backend and frontend. The backend container runs `alembic upgrade head` automatically on start, so migrations are already applied.

First build takes a few minutes (downloading base images and installing dependencies). Subsequent starts are fast.

Verify everything is healthy:

```bash
docker compose ps
curl http://localhost:8001/docs   # 200 OK once the backend is up
curl http://localhost:3000        # 200 OK once the frontend is up
```

### 3. Hot-reload

The source is bind-mounted into the containers, so editing files under `backend/` or `frontend/` reloads live — no rebuild needed.

When **dependencies** change you need an extra step, because `node_modules` lives in a named volume (not the bind-mount). After pulling code that adds a frontend package — or after running `bun add` yourself — install it **inside the container**, then restart it:

```bash
docker compose -f docker/local/docker-compose.yml exec frontend bun install
docker compose -f docker/local/docker-compose.yml restart frontend
```

For backend dependency changes (`pyproject.toml`/`uv.lock`), rebuild instead: `docker compose up -d --build`.

### 4. Create the first admin

```bash
docker compose exec backend python scripts/create_admin.py
```

Reads `ADMIN_*` from the backend environment, idempotent. With the example defaults you can then log in at http://localhost:3000/login with `admin@edu.fh-joanneum.at` / `12345678900!`.

### 5. Stop

```bash
docker compose down        # stop, keep data
docker compose down -v     # stop and wipe volumes (fresh DB next start)
```

Continue with [Service URLs](#service-urls) and the [auth flow](#end-to-end-auth-flow).

---

## Option B — Native

Backend and frontend run directly on your machine; only infrastructure runs in Docker.

### Prerequisites

- Docker + Docker Compose
- [uv](https://docs.astral.sh/uv/) (backend package manager)
- [Bun](https://bun.com/) (frontend package manager)
- GNU Make
  - Debian/Ubuntu: `sudo apt install make`
  - Arch: `sudo pacman -S make`
  - macOS: comes with Xcode Command Line Tools (`xcode-select --install`)
  - Windows: install via [Chocolatey](https://chocolatey.org/) (`choco install make`), [Scoop](https://scoop.sh/) (`scoop install make`), or just use WSL
- `libmagic` (system library used for MIME-type detection on document upload)
  - Debian/Ubuntu: `sudo apt install libmagic1`
  - Arch: `sudo pacman -S file`
  - macOS: `brew install libmagic`
  - NixOS: add `pkgs.file` to your shell environment
- `openssl` (for generating `SECRET_KEY`)

### 1. Environment Files

#### Backend

```bash
cp backend/.env-example backend/.env
```

Generate a real `SECRET_KEY`:

```bash
openssl rand -hex 32
```

Paste the output into `backend/.env` as `SECRET_KEY=...`. The default `DATABASE_URL` already points at the local Postgres container — change only if you want to hit staging.

#### Frontend

```bash
cp frontend/.env.example frontend/.env.local
```

The default `NEXT_PUBLIC_API_URL=http://localhost:8001` works for local dev — no changes needed.

#### Docker (local infrastructure)

```bash
cp docker/local/.env-example docker/local/.env
```

The defaults work as-is.

### 2. Infrastructure

Start Postgres, Redis, Weaviate, Mailpit, and MinIO (infrastructure only — backend and frontend run natively below):

```bash
cd backend
make db-up
```

`db-up` wraps `docker compose` against `docker/local/docker-compose.yml`. Verify everything is healthy:

```bash
docker ps
```

### 3. Backend

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

Create the first admin (reads `ADMIN_*` from `backend/.env`, idempotent):

```bash
make create-admin
```

With the example defaults you can then log in at http://localhost:3000/login with `admin@edu.fh-joanneum.at` / `12345678900!`.

### 4. Frontend

In a new terminal:

```bash
cd frontend
bun install
bun dev                 # Next.js on port 3000
```

---

## Service URLs

| Service | URL |
|---|---|
| Frontend | http://localhost:3000 |
| Backend | http://localhost:8001 |
| Backend OpenAPI | http://localhost:8001/docs |
| Mailpit UI | http://localhost:8025 |
| MinIO Console | http://localhost:9001 |
| Postgres | `localhost:5432` |
| Redis | `localhost:6379` |
| Weaviate | http://localhost:8100 |

## End-to-End Auth Flow

1. Open http://localhost:3000/register
2. Enter an `@edu.fh-joanneum.at` address (any address works locally — Mailpit catches it)
3. Open http://localhost:8025 — the verify email is there
4. Click **"Konto einrichten"** (or "Set up account") in the email
5. Enter username + password (min 12 chars) → redirected to home
6. Header avatar shows your initials → click → see role + **Logout**

## Common Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| Backend fails to start with `SECRET_KEY must be at least 32 characters` | `.env` placeholder still in place | Generate with `openssl rand -hex 32` |
| Frontend gets CORS errors on `/auth/refresh` | Backend not running or wrong port | Check `make dev` is up on 8001 |
| No email arrives in Mailpit | Mailpit container down | `docker ps` — restart with `make db-up` |
| Login succeeds but `/me` returns 401 | Stale cookie from previous run | Clear cookies for `localhost:8001` |
| Database errors after pulling code | New migrations not applied | `uv run alembic upgrade head` |
| `password authentication failed for user "..."` on migrations | Postgres volume baked credentials from a previous run | `make db-reset` (drops volumes, recreates with current `.env`) |
| Backend crashes with `ImportError: failed to find libmagic` | System library missing (native only — the Docker image bundles it) | Install libmagic — see Option B Prerequisites |
| (Docker) Code changes don't reload | Dependency changed, or watcher missed the file | Rebuild: `docker compose up -d --build` |
| (Docker) Frontend: `Module not found` after adding a package | New dependency isn't in the container's `node_modules` volume | `docker compose -f docker/local/docker-compose.yml exec frontend bun install` then `restart frontend` |
| (Docker) Backend can't reach Postgres/MinIO | Edited host to `localhost` instead of the service name | Inside containers, use service names (`postgres`, `minio`, `redis`, `weaviate`, `mailpit`) — `localhost` only works for the browser |
| (Docker) Port already in use on 3000/8001/5432 | A native `bun dev` / `make dev` / old Postgres is still running | Stop the native process (or the other stack) before `docker compose up` |

## Useful Make Targets (native)

```bash
make dev          # start backend with auto-reload (port 8001)
make db-up        # start local docker services
make db-down      # stop local docker services
make db-reset     # destroy volumes and recreate everything
make test         # smoke-check that packages import and /health responds
make clean        # remove __pycache__ etc.
```
