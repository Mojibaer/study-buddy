# StudyBuddy Backend — Production Operations

The backend runs as a Docker container (`studybuddy-backend`), built in CI and
pulled from ghcr.io. Inside the container the entrypoint logs in to Infisical,
runs `alembic upgrade head`, then starts `uvicorn` on port 8001 with 4 workers.

The full architecture (multi-stage images, CI/CD, secret injection, two
environments on one VPS) is documented in
[ADR-0004](../adr/0004-server-deployment-and-cicd.md). This page is the
day-to-day operations cheat sheet.

Run the commands below from the environment's compose directory:

- Production: `/home/studybuddy/production/docker/server/prod`
- Staging: `/home/studybuddy/staging/docker/server/staging`

## Container Management

```bash
docker compose ps                  # status
docker compose pull backend        # fetch the latest image tag
docker compose up -d backend       # (re)create with the pulled image
docker compose restart backend     # restart (e.g. to re-pull Infisical secrets)
docker compose stop backend
```

Deploys are normally automatic (push to `main` → staging, GitHub release →
production); manual `pull` + `up -d` is only for hotfixes or rollbacks.

## Logs

```bash
docker compose logs -f backend            # follow
docker compose logs --tail 100 backend    # last 100 lines
```

## Health Check

```bash
curl http://127.0.0.1:8001/health   # prod; staging is 127.0.0.1:8002
```

## Configuration

The container holds no app secrets. Its environment carries only the Infisical
connection details (`INFISICAL_*`); everything else (`DATABASE_URL`, `SECRET_KEY`,
`MINIO_*`, `WEAVIATE_*`, mail, cookie flags) is injected at runtime by
`infisical run`. The only on-server `.env` holds the Infisical credentials plus
the infra bootstrap minimum. See ADR-0004 §4.

## Troubleshooting

```bash
# Container keeps restarting — read the startup logs (Infisical login, migrations)
docker compose logs --tail 50 backend

# Confirm injected env actually reached the process
docker compose exec backend printenv | grep -E 'DATABASE_URL|WEAVIATE|MINIO|SMTP'

# Port already in use on the host
sudo lsof -i :8001
```

A failed Alembic migration crashes the container into a restart loop — the cause
is in the logs above. There is no automated rollback (ADR-0004, Remaining Surface).
