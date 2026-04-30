# Environment Setup Guide

## Local Development

Copy the example file and fill in the values:

```bash
cd backend
cp .env-example .env
```

### Required Variables

| Variable | Description |
|---|---|
| `SECRET_KEY` | Random string >= 32 characters — run `openssl rand -hex 32` |
| `DATABASE_URL` | PostgreSQL connection string |
| `REDIS_URL` | Redis connection string |
| `MINIO_ENDPOINT` | MinIO host and port |
| `MINIO_ACCESS_KEY` | MinIO access key |
| `MINIO_SECRET_KEY` | MinIO secret key |
| `MINIO_BUCKET` | Bucket name for document storage |
| `MINIO_PUBLIC_URL` | Public URL for serving files |

For local development, PostgreSQL and Redis are provided via Docker Compose — see [docker/local/](../docker/local/).
MinIO does not run locally; the development bucket on the shared MinIO instance is used instead. Contact a maintainer for credentials.

## Staging & Production

Secrets for staging and production are managed via [Infisical](https://infisical.com/). Contact a maintainer to get access to the project in Infisical.
