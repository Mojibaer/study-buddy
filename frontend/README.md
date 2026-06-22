# Study Buddy — Frontend

Next.js frontend for document management and semantic search.

## Run with Docker (recommended)

The frontend has a `Dockerfile` and is wired into [docker/local/docker-compose.yml](../docker/local/docker-compose.yml). Run the full stack — no local `Bun` needed:

```bash
cd docker/local
docker compose up -d --build      # frontend, backend, and all infrastructure
```

Serves on `http://localhost:3000` with hot-reload (source is bind-mounted). Rebuild only when dependencies (`package.json`/`bun.lock`) change. See the [Local Testing Guide](../docs/local-testing-guide.md#option-a--docker-recommended).

The native setup below is for running without containers.

## Prerequisites (native)

- [Bun](https://bun.sh/) (package manager)
- Backend running on `http://localhost:8001`

## Setup (native)

```bash
cd frontend

# Install dependencies
bun install

# Copy and configure environment variables
cp .env.example .env.local
```

## Running

```bash
bun dev
```

The app runs on `http://localhost:3000`

## Tech Stack

- **Next.js 16** — React framework
- **TypeScript**
- **Tailwind CSS v4** + **shadcn/ui** — Styling and UI components
