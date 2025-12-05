## Overview

Alembic manages database schema migrations - version control for PostgreSQL structure.

**What it does:**
- Track schema changes over time
- Apply migrations (upgrade)
- Rollback migrations (downgrade)
- Generate migrations from model changes

**What it doesn't do:**
- Manage data (only structure)
- Handle ChromaDB or MinIO

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
│   └── versions/            # Migration files
│       ├── 001_initial.py
│       └── 002_add_file_url.py
```

## Useful Commands
```bash
# Activate venv first
cd backend
source venv/bin/activate  # Linux
venv\Scripts\activate     # Windows

# Check current migration status
alembic current

# Show migration history
alembic history

# Create new migration (auto-generate from models)
alembic revision --autogenerate -m "description"

# Create empty migration (manual)
alembic revision -m "description"

# Apply all pending migrations
alembic upgrade head

# Apply next migration
alembic upgrade +1

# Rollback last migration
alembic downgrade -1

# Rollback all migrations
alembic downgrade base

# Show SQL without executing
alembic upgrade head --sql
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

**Database URL in `alembic.ini`:**
```ini
sqlalchemy.url = postgresql://studybuddy:<password>@localhost:5432/studybuddy
```

**Or via environment variable in `env.py`:**
```python
config.set_main_option('sqlalchemy.url', os.getenv('DATABASE_URL'))
```