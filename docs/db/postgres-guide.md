# Postgres Setup and guide

## Overview

PostgreSQL stores document metadata - everything except the actual file content and search embeddings.

**What it stores:**
- File information (filename, size, type, upload date)
- Organization data (category, subject, semester, tags)
- References to MinIO (file_url) and ChromaDB (chroma_id)

**What it doesn't store:**
- Extracted text → ChromaDB
- File content → MinIO
- Search embeddings → ChromaDB

## Useful Commands
```bash
# Connect to database - on server
docker exec -it studybuddy-db psql -U studybuddy -d studybuddy
```
```sql
-- Describe table structure
\d documents

-- Select all documents
SELECT * FROM documents;

-- Select with readable output
SELECT id, original_filename, category, semester FROM documents;

-- Delete single document
DELETE FROM documents WHERE id = 1;

-- Delete all documents
DELETE FROM documents;

-- Count documents
SELECT COUNT(*) FROM documents;
```
## Location

### PostgreSQL as Service

Database for document metadata.

**Remote connection (from local machine):**
```env
DATABASE_URL=postgresql://studybuddy:<password>@85.215.241.173:5432/studybuddy
```

**Local connection (on server or local Docker):**
```env
DATABASE_URL=postgresql://studybuddy:<password>@localhost:5432/studybuddy
```