## Overview

Alembic manages database schema migrations - version control for PostgreSQL structure.

**What it does:**
- Track schema changes over time
- Apply migrations (upgrade)
- Rollback migrations (downgrade)
- Generate migrations from model changes

**What it doesn't do:**
- Manage data (only structure)
- Handle Weaviate or MinIO

## How It Works

1. Change SQLAlchemy models in `models.py`
2. Generate migration file with Alembic
3. Apply migration to database
4. Migration history tracked in `alembic_version` table

## Project Structure
```
backend/
├── alembic.ini              # Alembic config
├── alembic/
│   ├── env.py               # Migration environment
│   ├── script.py.mako       # Migration template
│   └── versions/            # Migration files (hash-prefixed revision IDs)
```

## Useful Commands

The project uses **uv** — prefix Alembic with `uv run` (no virtualenv to activate).

```bash
cd backend

# Check current migration status
uv run alembic current

# Show migration history
uv run alembic history

# Create new migration (auto-generate from models)
uv run alembic revision --autogenerate -m "description"

# Create empty migration (manual)
uv run alembic revision -m "description"

# Apply all pending migrations
uv run alembic upgrade head

# Apply next migration
uv run alembic upgrade +1

# Rollback last migration
uv run alembic downgrade -1

# Rollback all migrations
uv run alembic downgrade base

# Show SQL without executing
uv run alembic upgrade head --sql
```

## Migration File Example
```python
"""add file_url column

Revision ID: 002
Revises: 001
"""
from alembic import op
import sqlalchemy as sa

def upgrade():
    op.add_column('documents', sa.Column('file_url', sa.String()))

def downgrade():
    op.drop_column('documents', 'file_url')
```

## Location

### Alembic Config

The `sqlalchemy.url` in `alembic.ini` is only a placeholder. The real connection string is read from the `DATABASE_URL` environment variable in `env.py`:

```python
# backend/alembic/env.py
return os.environ["DATABASE_URL"]
```

So migrations use the same `DATABASE_URL` as the running backend — no separate config to keep in sync.