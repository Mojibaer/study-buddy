# ADR-0004: Server Setup, Containerized Deployment, and CI/CD

**Status:** Accepted
**Date:** 2026-06-23
**Issue:** DEPLOY-00

## Context

Study Buddy ran on a single Strato VPS with backend and frontend deployed as
**systemd services**: the deploy workflow SSH'd in, ran `git pull` + `uv sync`
/ `bun run build`, and restarted the service. Infrastructure (PostgreSQL, Redis,
a vector DB, MinIO) ran as Docker containers started by hand from compose files
scattered across several repo checkouts (`live/`, `staging/`, `study-buddy/`).

This had grown brittle:

- Builds ran **on the server** — each deploy needed `uv`, `bun`, and build
  toolchains installed and consumed VPS CPU/RAM at deploy time.
- The repo checkouts had drifted from the committed compose files (the server
  ran ChromaDB while the code had moved to Weaviate).
- Local development required every contributor to install `uv`, `Bun`, `Make`,
  and `libmagic` natively.
- Secrets lived in plain `.env` files on the server with no central management,
  despite a self-hosted Infisical instance already running on the same box.

The goal: one reproducible, container-based pipeline that builds images in CI,
publishes them, and deploys them to **two isolated environments** (staging and
production) on the same VPS — with secrets pulled at runtime from Infisical, and
without exposing infrastructure ports to the internet.

The embedding/vector decisions are set by
[ADR-0002](0002-weaviate-voyage-embedding-stack.md); the auth model by
[ADR-0001](0001-jwt-storage-strategy.md). This ADR covers only how the app is
built, shipped, and run on servers.

## Decisions

### 1. Multi-stage Dockerfiles with a `dev` and a `prod` stage

Backend and frontend each have one Dockerfile with two named build targets:

- **`dev`** — dependencies only; source is bind-mounted at runtime and the app
  runs with hot-reload (`uvicorn --reload` / `next dev`). Used by the local
  compose (`docker/local`).
- **`prod`** — source baked into the image, built once (`next build`), no mount.
  Used by both staging and production.

- **Why two stages, not two Dockerfiles?** The dependency-install layer is
  shared, so the images stay consistent and the cache is reused. `dev` keeps the
  zero-install local experience; `prod` produces an immutable artifact.
- **Why does staging use the same `prod` stage as production?** Staging exists to
  test the *exact* artifact that will go to production. A separate "staging
  build" would defeat that. The only thing that differs between the two is
  configuration (secrets, ports, domain) — never the image.

### 2. Images are built in CI and pulled from ghcr.io — never built on the server

`deploy.yml` builds `backend` and `frontend` (matrix), targets the `prod` stage,
and pushes to `ghcr.io/mojibaer/study-buddy-{backend,frontend}`. The server only
runs `docker compose pull && up -d`.

- **Why a registry instead of build-on-server?** The server no longer needs build
  tooling or spare CPU/RAM at deploy time. The image is a reproducible artifact:
  the same digest that passed on staging is the one promoted to production.
- **Why ghcr.io?** The repo is public open-source, so images are public and free,
  and the server pulls them with no registry login. Authentication for the push
  uses the workflow's `GITHUB_TOKEN`.
- **Caveat (one-time):** packages are private on first publish — they must be
  switched to **public** once, or the server pull fails with a permission error.

### 3. One image serves both environments — config comes at runtime

The frontend talks to the backend over a **relative `/api` path** (Nginx routes
it), so `NEXT_PUBLIC_API_URL=/api` is baked into the build and is identical for
staging and production → **one frontend image** for both. The backend image is
environment-neutral by design (see Decision 4).

- **Why relative `/api` instead of absolute domains?** `NEXT_PUBLIC_*` is inlined
  into the client bundle at build time. Absolute per-environment domains would
  force a separate image build per environment. A relative path resolves against
  whatever host the browser is on, so one artifact works everywhere behind Nginx.
- **Verified:** all frontend API calls are client-side (`'use client'`); no
  server component or middleware fetches the API, so a relative URL never has to
  resolve on the Node server (where it would have no host).

### 4. Secrets are fetched at runtime from self-hosted Infisical

The backend `prod` image bundles the Infisical CLI. Its entrypoint logs in with
a **machine identity** (Universal Auth, `--client-id`/`--client-secret`) against
the self-hosted instance, then runs the app under `infisical run`, which injects
all secrets (`DATABASE_URL`, `SECRET_KEY`, `MINIO_*`, `WEAVIATE_*`, `ADMIN_*`,
cookie flags, embedding config) as environment variables.

- **Why runtime injection over baked-in env?** No secret ever lands in the image
  (critical for public images) or in the repo. Secrets rotate in Infisical
  without rebuilding.
- **Why per-environment machine identities?** Two identities — `studybuddy-staging`
  (Viewer on the `staging` env only) and `studybuddy-prod` (Viewer on `prod` only)
  — so a leaked staging token cannot read production secrets. The project is one
  Infisical project (`studybuddy`) with `dev`/`staging`/`prod` environments.
- **Why does a small `.env` still exist on the server?** Henhouse/egg: the infra
  containers (Postgres, Weaviate) need their credentials **before** the backend —
  and therefore before Infisical — can run. The server `.env` holds only that
  bootstrap minimum plus the Infisical connection details (URL, project id,
  client id/secret). Everything else lives in Infisical. Values that secure a
  shared resource (Postgres password, Weaviate key, MinIO secret) must be
  **identical** in the `.env` and in the matching Infisical secret.

### 5. Two environments on one VPS, separated by directory, network, and ports

| | staging | production |
|---|---|---|
| Deploy dir | `/home/studybuddy/staging` | `/home/studybuddy/production` |
| Compose | `docker/server/staging` | `docker/server/prod` |
| Backend host port | `127.0.0.1:8002` | `127.0.0.1:8001` |
| Frontend host port | `127.0.0.1:3001` | `127.0.0.1:3000` |
| Docker network | `studybuddy-staging-network` | `studybuddy-network` |
| Infisical env | `staging` | `prod` |
| Image tag | `:staging` | `:prod` |

Each environment is a separate git checkout running its own compose stack
(Postgres, Redis, Weaviate, backend, frontend). MinIO is a single **shared**
stack (`docker/server/minio`, `/home/studybuddy/shared`) reached by both backends
via `host.docker.internal:9000`, separated by bucket (`studybuddy-staging` vs.
`studybuddy-prod`).

- **Why one VPS, two stacks?** Cost. Isolation comes from separate networks,
  volumes, and credentials rather than separate machines.
- **Why shared MinIO?** Resource saving. Bucket separation keeps the objects
  apart. *(Open item: the shared root credentials mean a backend could technically
  reach the other env's bucket; bucket-scoped access keys would harden this.)*

### 6. Triggers: push to `main` → staging, GitHub release → production

`deploy.yml` derives the target from the event: `push` to `main` deploys
staging; a published `release` deploys production. Both run the same build, only
the tag / deploy dir / Infisical env differ.

- **Why this split?** Every merge to `main` is continuously validated on staging.
  Promotion to production is a deliberate act (cutting a release/tag), not an
  accidental side-effect of merging.

### 7. Infrastructure ports are not published to the host

Postgres, Redis, and Weaviate have **no** host port mapping on the servers — they
are reachable only on the internal Docker network. Only backend and frontend bind
to the host, and only on `127.0.0.1` (Nginx terminates TLS and proxies to them).

- **Why?** The earlier compose files published Postgres (`5432`), Redis (`6379`),
  and Weaviate (`8100`) on `0.0.0.0`, i.e. potentially reachable from the
  internet. Internal-only access removes that exposure. Weaviate additionally
  runs with API-key auth on the servers as defence in depth.

### 8. Nginx must speak HTTP/1.1 to the Next.js upstream

The `location /` block proxying to the frontend sets
`proxy_http_version 1.1;` and `proxy_set_header Connection "";`.

- **Why?** `next start` returns responses with `Transfer-Encoding: chunked` and
  no `Content-Length`. Chunked encoding is an HTTP/1.1 feature and is invalid on
  HTTP/1.0 (Nginx's default toward upstreams). Without this, Nginx cannot frame
  the body, waits for an EOF that never comes, and every asset request hangs to
  `proxy_read_timeout`. The `/api/` (uvicorn) block was unaffected because uvicorn
  sends `Content-Length`, but the directives are added there too in case the API
  ever streams. This config lives on the server, outside the repo.

## Consequences

- Local dev needs only Docker; `uv`/`Bun`/`Make`/`libmagic` are no longer
  required on a contributor's machine.
- The backend image dropped ~3–4 GB by removing unused `torch`/`torchvision`/
  `torchaudio` (embedding runs on `onnxruntime` via fastembed, not torch) — making
  pulls and deploys fast.
- A first deploy to a fresh environment still needs three manual one-time steps,
  not yet automated:
  1. create the server `.env` (Infisical credentials + infra bootstrap),
  2. populate the Infisical environment,
  3. create the first admin via `scripts/create_admin.py` (run under
     `infisical run` so it sees `ADMIN_*` and `DATABASE_URL`).

## Remaining Surface

- **Admin bootstrap is manual.** `create_admin.py` is idempotent and could run
  from the entrypoint on start; currently it is a one-off `docker exec`.
- **Nginx config is unversioned.** The `proxy_http_version` fix and the
  `/api`, `/files` routing live only on the server. They should be tracked in the
  repo (or templated) so a rebuild of the box reproduces them.
- **Shared MinIO uses root credentials.** Bucket-scoped access keys per
  environment would give real isolation instead of bucket-name separation.
- **SMTP / outbound email — provider chosen, not yet provisioned.** The app is
  provider-neutral (`email_service.py` reads `SMTP_*` / `MAIL_*` from config;
  `USE_CREDENTIALS` keys off whether `SMTP_USER` is set, so auth-less Mailpit and
  an authenticated relay both work with no code change). **Resend** is the chosen
  relay. Only **production** sends real mail: set `SMTP_HOST=smtp.resend.com`,
  `SMTP_PORT=587`, `SMTP_USER=resend`, `SMTP_PASSWORD=<api-key>`,
  `SMTP_STARTTLS=true`, `SMTP_SSL=false`, `MAIL_FROM=no-reply@studybuddy.mojiverse.dev`
  in the Infisical `prod` env. One-time: verify the single domain
  `studybuddy.mojiverse.dev` in Resend (SPF/DKIM DNS records) — no separate
  `staging.*` mail domain. **Staging does not send real mail** (sandbox / intercept
  only), so it never delivers to real `@edu.fh-joanneum.at` addresses during tests.
  Until prod is provisioned, email verification fails there.
- **No automated rollback.** Rolling back means re-pulling a previous image tag by
  hand; an `upstream{}` keepalive pool and tagged release images would streamline
  this.
