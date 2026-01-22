## Overview

MinIO stores the actual document files - PDFs, DOCX, TXT, MD uploaded by users.

**What it stores:**
- Original uploaded files
- Accessible via presigned URLs for preview/download

**What it doesn't store:**
- File metadata → PostgreSQL
- Text content & embeddings → ChromaDB

**Why MinIO:**
- S3-compatible API (works with boto3, AWS SDKs)
- Self-hosted, no cloud costs
- Presigned URLs for secure file sharing

## How It Works

1. User uploads file → stored in MinIO bucket
2. UUID filename generated to prevent conflicts
3. Presigned URL created for frontend access
4. URL stored in PostgreSQL (`file_url`)

## Current Buckets
```
documents/          # Production files
test-documents/     # Development/testing
```

## Useful Commands

**Web Console:**
```
https://minio.mojiverse.dev/
```

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

**Remote connection (from local machine):**
```env
MINIO_ENDPOINT=85.215.241.173:9000
MINIO_ACCESS_KEY=studybuddy
MINIO_SECRET_KEY=<MINIO_ROOT_PASSWORD from .env>
MINIO_BUCKET=test-documents
MINIO_PUBLIC_URL=https://studybuddy.mojiverse.dev/files
```

**Local connection (on server):**
```env
MINIO_ENDPOINT=localhost:9000
MINIO_ACCESS_KEY=studybuddy
MINIO_SECRET_KEY=<MINIO_ROOT_PASSWORD from .env>
MINIO_BUCKET=documents
MINIO_PUBLIC_URL=https://studybuddy.mojiverse.dev/files
```