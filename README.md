# Study Buddy
---
A smart web application for managing, searching and sharing academic documents.

## Overview
---
Study Buddy is a web application that enables students to upload, manage, and search their academic documents using three powerful methods:

- **Manual Browsing** - Traditional folder/category navigation
- **Semantic Search** - AI-powered content search (text-based files only)
- **Metadata Filtering** - Filter by category, tags, semester, subject, etc.

These methods can be combined for optimal results (e.g., "Search for 'recursion' only in Algorithm course materials").

## Features
---
### Must have

1. **Document Upload** - Support for PDF, DOCX, TXT, MD, and more
2. **Manual Browsing** - Traditional folder/category navigation
3. **Semantic Search** - AI-powered content search with ChromaDB
4. **Combined Search** - Semantic search + metadata filters with real-time autocomplete
5. **File Sharing** - Share documents via WhatsApp and email
6. **Document Preview** - View documents directly in browser

### Nice to have

1. **Authentication System** - Secure user login and registration
2. **User Management** - Role-based access control
3. **Pinboard / Favorites** - Pin important documents for quick access

## Tech Stack
---
### Frontend
- **Next.js** - React framework for production
- **Shadcn UI** - Modern, accessible UI component library

[installation guide](frontend/README.md)

### Backend
- **FastAPI** - High-performance REST API framework
- **ChromaDB** - Vector database for semantic search and embeddings

[installation guide](backend/README.md)

### Database
- **PostgreSQL** - Relational database for metadata and user data
- **ChromaDB** - Vector database for document content and embeddings

    - [postgres guide](docs/db/postgres-guide.md)
    - [chromaDB guide](docs/db/postgres-guide.md)

### DevOps
- **Docker** - Containerization for local postgres instance possible
- **Nginx** - Reverse proxy and web server

[server-setup-guide](docs/db/server-setup.md)

### Storage
- **MinIO** - OpenSource storage application for Documents with S3-API compatibilty

[minio guide](docs/db/minio-storage.md)

## Contributors
---
- Hassan Erfani
- Alexander Gherman
- Andreas Baldauf
- Michael Koncsik
- Tine Simenc