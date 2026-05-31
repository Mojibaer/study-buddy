## Overview

MinIO stores the actual document files - PDFs, DOCX, TXT, MD uploaded by users.

**What it stores:**
- Original uploaded files
- Accessible via presigned URLs for preview/download

**What it doesn't store:**
- File metadata → PostgreSQL
- Text snippet & embeddings → Weaviate

**Why MinIO:**
- S3-compatible API (works with boto3, AWS SDKs)
- Self-hosted, no cloud costs
- Presigned URLs for secure file sharing

## How It Works

1. User uploads file → stored in MinIO bucket
2. UUID filename generated to prevent conflicts
3. Presigned URL created for frontend access
4. URL stored in PostgreSQL (`file_url`)

## Buckets

The bucket name comes from `MINIO_BUCKET`. The local default (from `backend/.env-example`) is `studybuddy-dev`; staging/production use their own buckets configured via Infisical.

## Useful Commands

**Web Console:** locally on http://localhost:9001

**CLI (mc client):**
```bash
# Configure alias
mc alias set studybuddy http://localhost:9000 <minio-access-key> <secret_key> # Already created on server, just use mc alias

# Bucket Policy setzen:
mc anonymous set download local/ <bucket-name>

# List buckets
mc ls studybuddy

# List files in bucket
mc ls studybuddy/<bucket-name>

# Upload file
mc cp file.pdf studybuddy/<bucket-name>/

# Download file
mc cp studybuddy/<bucket-name>/file.pdf ./

# Delete file
mc rm studybuddy/<bucket-name>/file.pdf

# Delete all files in bucket
mc rm --recursive studybuddy/<bucket-name>/
```

## Location

### MinIO as Service

Object storage for document files.

**Local Docker (default from `backend/.env-example`):**
```env
MINIO_ENDPOINT=localhost:9000
MINIO_ACCESS_KEY=studybuddy
MINIO_SECRET_KEY=studybuddy123
MINIO_BUCKET=studybuddy-dev
MINIO_SECURE=false
MINIO_PUBLIC_URL=http://localhost:9000
```

For staging/production the endpoint, credentials, and public URL are injected via Infisical — see [server-setup.md](../server-setup.md).