# Study Buddy

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Python](https://img.shields.io/badge/Python-3.13-blue?logo=python&logoColor=white)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.119-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js&logoColor=white)](https://nextjs.org/)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white)](https://www.docker.com/)

A smart web application for managing, searching and sharing academic documents.

## Overview

Study Buddy is an open-source academic document platform built for university students. It gives students a single place to upload, organize, and find course materials — with AI-powered semantic search that understands content, not just filenames.

Designed to be self-hosted by any university or student organization, Study Buddy is built with a modern, production-ready stack and can be adapted to fit different institutions, curricula, and authentication requirements.

## Features

- **Document Upload** — Support for PDF, DOCX, TXT, MD, and more
- **Manual Browsing** — Traditional folder/category navigation
- **Semantic Search** — AI-powered content search with ChromaDB
- **Combined Search** — Semantic search + metadata filters with real-time autocomplete
- **Document Preview** — View documents directly in browser
- **Authentication** — JWT-based auth with email verification and role-based access control
- **File Sharing** — Share documents via WhatsApp and email

## Tech Stack

### Frontend
- **Next.js 16** — React framework
- **Tailwind CSS v4** + **shadcn/ui** — Styling and UI components
- **TypeScript**

### Backend
- **FastAPI** — High-performance async REST API
- **SQLAlchemy 2** + **Alembic** — ORM and database migrations
- **PyJWT** + **Argon2** — JWT authentication and password hashing

### Databases
- **PostgreSQL 17** — Primary relational database
- **Redis 7** — Token denylist and caching
- **Weaviate 1.30** — Vector database for document embeddings

### Infrastructure
- **Docker Compose** — Local development environment
- **MinIO** — S3-compatible object storage for documents
- **Nginx** — Reverse proxy

## Architecture

For a detailed overview of how the services interact, see [docs/architecture.md](docs/architecture.md).

## Quick Start

```bash
# 1. Clone the repository
git clone https://github.com/Mojibaer/study-buddy.git
cd study-buddy

# 2. Start infrastructure (PostgreSQL, Redis, Weaviate)
docker compose -f docker/local/docker-compose.yml up -d

# 3. Start backend and frontend
# See setup guides below
```

- [Backend setup](backend/README.md)
- [Frontend setup](frontend/README.md)

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/) >= 24 + Docker Compose
- [Python](https://www.python.org/downloads/) >= 3.13
- [uv](https://docs.astral.sh/uv/getting-started/installation/) (Python package manager)
- [Bun](https://bun.sh/) (Frontend package manager)

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for branch conventions, commit style, and PR process.

## Contributors

- Hassan Erfani
- Alexander Gherman
- Andreas Baldauf
- Michael Koncsik
- Tine Simenc
