"""add_tags_column_to_documents

Revision ID: c0a51ef201e8
Revises: d35e0586e53a
Create Date: 2026-05-27 15:32:01.069706

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = 'a1b2c3d4e5f6'
down_revision: Union[str, Sequence[str], None] = 'd35e0586e53a'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('documents', sa.Column('tags', sa.Text(), nullable=True))


def downgrade() -> None:
    op.drop_column('documents', 'tags')