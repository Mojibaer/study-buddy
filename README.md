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

An admin dashboard gives maintainers full control over the platform: managing users, moderating uploaded documents, and curating the study structure (semesters, subjects, and categories) that documents are organized under.

## Features

- **Document Upload** — Support for PDF, DOCX, TXT, MD, and more
- **Manual Browsing** — Traditional folder/category navigation
- **Semantic Search** — AI-powered content search with Weaviate
- **Combined Search** — Semantic search + metadata filters with real-time autocomplete
- **Document Preview** — View documents directly in browser
- **Authentication** — JWT-based auth with email verification and role-based access control
- **File Sharing** — Share documents via WhatsApp and email
- **Admin Dashboard** — Manage users, moderate documents, and curate the study structure (semesters, subjects, categories)

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

## Architecture

For a detailed overview of how the services interact, see [docs/architecture.md](docs/architecture.md).

## Quick Start

The whole stack — backend, frontend, and infrastructure — runs in Docker. You only need Docker and `openssl`; no local `uv`, `Bun`, `Make`, or `libmagic` required.

```bash
git clone https://github.com/Mojibaer/study-buddy.git
cd study-buddy

# Configure environment (generate a 32+ char SECRET_KEY and paste it in)
cp docker/local/.env-example docker/local/.env
openssl rand -hex 32

# Build and start everything (migrations run automatically)
cd docker/local
docker compose up -d --build
```

Then open http://localhost:3000.

For the full walkthrough — including the native (non-Docker) setup, admin bootstrap, and the end-to-end auth flow — follow the **[Local Testing Guide](docs/local-testing-guide.md)**.

For component-specific details, see also:

- [Backend setup](backend/README.md)
- [Frontend setup](frontend/README.md)

## Prerequisites

For the Docker quick start above:

- [Docker](https://docs.docker.com/get-docker/) >= 24 + Docker Compose
- `openssl` (for generating `SECRET_KEY`)

Running backend/frontend natively (Option B in the guide) additionally needs `Python >= 3.13`, [uv](https://docs.astral.sh/uv/getting-started/installation/), [Bun](https://bun.sh/), GNU Make, and `libmagic`. OS-specific install commands are in the [Local Testing Guide](docs/local-testing-guide.md#option-b--native).

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for branch conventions, commit style, and PR process.

## Contributors

- Hassan Erfani
- Alexander Gherman
- Andreas Baldauf
- Michael Koncsik
- Tine Simenc
