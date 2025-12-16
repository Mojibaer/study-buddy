# Environment Setup Guide

## Prerequisites

- SSH access to the server (contact @hassan erfani if your SSH key is not registered)
- Server address: `studybuddy@85.215.241.173`

## Getting Credentials

The database and MinIO credentials are stored on the server.

1. Connect to the server:

```bash
ssh studybuddy@85.215.241.173
```

2. View the credentials:

```bash
cat ~/docker/.env
```

## Backend Configuration

Copy the `.env-example` file in the `backend/` directory to `.env`

Replace the placeholder values with the credentials from the server. Only password for Postgres and MinIO is needed.

## Notes

- The server runs PostgreSQL 17, ChromaDB and MinIO in Docker containers
- All services are only accessible from the server or via SSH tunnel
