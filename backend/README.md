# Study Buddy - Backend

REST API backend for intelligent document management and semantic search.

## Description

Study Buddy Backend is a FastAPI-based REST API that provides document upload, storage, and semantic search capabilities. It uses ChromaDB for vector embeddings and semantic search, PostgreSQL for metadata storage, and supports multiple file formats including PDF, DOCX, TXT, and Markdown.

## Installation

### Prerequisites

- Python 3.13
- Docker & Docker Compose (optional for local development)
- Project is cloned - `git clone https://git-iit.fh-joanneum.at/swd24-hackathon/study-buddy.git`

### Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # Linux
venv\Scripts\activate     # Windows

# Install dependencies
pip install -r requirements.txt

# Setup environment variables
cp .env-example .env
```

[Environment-setup-guide](../docs/environment-setup-guide.md)

The API runs on `http://localhost:8001`

API Documentation: `http://localhost:8001/docs`

## Tech Stack

- **Framework:** FastAPI
- **Database:** PostgreSQL, ChromaDB
- **ORM:** SQLAlchemy
- **Server:** Uvicorn
- **DB Migrations**: Alembic

## How to Use

### Start Server

```bash
make run dev         # Development with auto-reload
# Only needed if Postgres is running locally
make db-up       # Start PostgreSQL
make db-down     # Stop PostgreSQL
```

### Upload Document

1. Open Swagger UI: `http://localhost:8001/docs`
2. Find `POST /documents/upload` endpoint
3. Click "Try it out"
4. Fill in the form:
   - **file:** Choose your file (PDF, DOCX, TXT, MD)
   - **category:** Computer Science
   - **subject:** Algorithms
   - **tags:** sorting,algorithms
5. Click "Execute"

### Search Documents

1. Open Swagger UI: `http://localhost:8001/docs`
2. Find `GET /search/semantic` endpoint
3. Click "Try it out"
4. Enter parameters:
   - **query:** sorting algorithms
   - **limit:** 10
5. Click "Execute"

### List All Documents

1. Open Swagger UI: `http://localhost:8001/docs`
2. Find `GET /documents` endpoint
3. Click "Try it out"
4. Click "Execute"
