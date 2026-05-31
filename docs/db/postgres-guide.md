# Postgres Setup and guide

## Overview

PostgreSQL is the source of truth for all relational data - everything except the actual file content and search embeddings.

**What it stores:**
- Users (`users`) — accounts, email, role, password hash, active flag
- Refresh tokens (`refresh_tokens`) — hashed refresh tokens for session rotation
- Study structure (`semesters`, `categories`, `subjects`) — the organization hierarchy documents are filed under
- Documents (`documents`) — file information (filename, size, type, upload date), the uploader, the reference to MinIO (`file_url`), and a `vectorized_at` timestamp marking whether the document has been indexed in Weaviate

**What it doesn't store:**
- Extracted text → Weaviate (snippet) / MinIO (original)
- File content → MinIO
- Search embeddings → Weaviate

## Useful Commands
```bash
# Connect to the local database container
docker exec -it studybuddy-local-postgres psql -U studybuddy-local -d studybuddy-local
```
```sql
-- Describe table structure
\d documents

-- Select all documents
SELECT * FROM documents;

-- Select with readable output
SELECT id, original_filename, category_id, subject_id FROM documents;

-- Documents not yet indexed in Weaviate (reindex backlog)
SELECT id, original_filename FROM documents WHERE vectorized_at IS NULL;

-- Delete single document
DELETE FROM documents WHERE id = 1;

-- Delete all documents
DELETE FROM documents;

-- Count documents
SELECT COUNT(*) FROM documents;
```
## Location

### PostgreSQL as Service

Database for document metadata. The backend connects via the async driver (`postgresql+asyncpg://`).

**Local Docker (default from `backend/.env-example`):**
```env
DATABASE_URL=postgresql+asyncpg://studybuddy-local:local-db@localhost:5432/studybuddy-local
```

For staging/production the connection string (host, credentials) is injected via Infisical — see [server-setup.md](../server-setup.md).