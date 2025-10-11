# Study Buddy

A smart web application for managing, searching and sharing academic documents.

## Overview

Study Buddy is a web application that enables students to upload, manage, and search their academic documents using three powerful methods:

- **Manual Browsing** - Traditional folder/category navigation
- **Semantic Search** - AI-powered content search (text-based files only)
- **Metadata Filtering** - Filter by category, tags, semester, subject, etc.

These methods can be combined for optimal results (e.g., "Search for 'recursion' only in Algorithm course materials").

## Features

### Must have

1. **Document Upload** - Support for PDF, DOCX, TXT, MD, and more
2. **Manual Browsing** - Traditional folder/category navigation
3. **Semantic Search** - AI-powered content search with ChromaDB
4. **Combined Search** - Semantic search + metadata filters with real-time autocomplete
5. **File Sharing** - Share documents via WhatsApp and email

### Nice to have

1. **Authentication System** - Secure user login and registration
2. **User Management** - Role-based access control
3. **Document Preview** - View documents directly in browser
4. **Pinboard / Favorites** - Pin important documents for quick access

## Tech Stack

### Frontend
- **Next.js** - React framework for production
- **Shadcn UI** - Modern, accessible UI component library
- **TanStack Query** - Data fetching and state management

### Backend
- **FastAPI** - High-performance REST API framework
- **ChromaDB** - Vector database for semantic search and embeddings

### Database
- **PostgreSQL** - Relational database for metadata and user data
- **ChromaDB** - Vector database for document content and embeddings

### DevOps
- **Docker** - Containerization for all services
- **Docker Compose** - Multi-container orchestration
- **Nginx** - Reverse proxy and web server

## Contributors

- Hassan Erfani
- Alexander Gherman
- Andreas Baldauf
- Michael Koncsik
- Maria Oporkina
- Tine Simenc