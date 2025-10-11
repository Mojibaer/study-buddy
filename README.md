# Study-Buddy

## Team Members

* Hassan Erfani
* Alexander Gherman
* Andreas Baldauf
* Michael Koncsik
* Maria Oporkina
* Tine Simenc

## Project

Study Buddy is a web-based platform that enables students to upload, manage, and search their academic documents using three powerful methods:

**Manual Browsing** - Traditional folder/category navigation

**Semantic Search** - AI-powered content search (text-based files only)

**Metadata Filtering** - Filter by category, tags, semester, subject, etc.

These methods can be combined for optimal results (e.g., "Search for 'recursion' only in Algorithm course materials").

## Features

* ### Must-have
    1. Manual Browsing - Traditional folder/category navigation
    2. Semantic Search - AI-powered content search with ChromaDB
    3. Combined Search - Semantic search + metadata filters with realtime search (autocomplete)
    4. Document Upload - PDF, DOCX, TXT, MD, etc.

* ### Nice to Have
    1. Authentication system for user login
    2. User Management
    3. Document Preview - View documents directly in browser
    4. Pinboard / Favorites
    5. Chat system for students

## Tech Stack

### Backend
* **FastAPI** - REST API endpoints handling
* **ChromaDB** - Vector database for semantic search and embeddings

### Frontend
* **Next.js** - React framework
* **Shadcn UI** - Modern UI component library
* **TanStack** - Data fetching and state management

### Database
* **PostgreSQL** - Relational database for metadata
* **ChromaDB** - Vector database for document content

### DevOps
* **Docker** - Containerization for all services
* **Nginx** - Reverse proxy and web server