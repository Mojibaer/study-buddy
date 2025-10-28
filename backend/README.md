# Study Buddy - Backend

REST API backend for intelligent document management and semantic search.

## Description

Study Buddy Backend is a FastAPI-based REST API that provides document upload, storage, and semantic search capabilities. It uses ChromaDB for vector embeddings and semantic search, PostgreSQL for metadata storage, and supports multiple file formats including PDF, DOCX, TXT, and Markdown.

## Installation

### Prerequisites

- Python 3.13
- Docker & Docker Compose

### Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Setup environment variables
cp env-example.txt .env
```

The API runs on `http://localhost:8001`

API Documentation: `http://localhost:8001/docs`

## Tech Stack

- **Framework:** FastAPI
- **Database:** PostgreSQL, ChromaDB
- **ORM:** SQLAlchemy
- **Server:** Uvicorn

## How to Use

### Start Server

```bash
make dev         # Development with auto-reload
alembic revision --autogenerate -m "initial migration" # Alembic init
alembic upgrade head # Apply migrations
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
