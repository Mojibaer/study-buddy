"""make username and password_hash nullable for two-step registration

Revision ID: d35e0586e53a
Revises: f8f989583499
Create Date: 2026-04-24

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = 'd35e0586e53a'
down_revision: Union[str, Sequence[str], None] = 'f8f989583499'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.alter_column('users', 'username', existing_type=sa.String(), nullable=True)
    op.alter_column('users', 'password_hash', existing_type=sa.String(), nullable=True)


def downgrade() -> None:
    # WARNING: will fail if any row has NULL username or password_hash
    op.alter_column('users', 'password_hash', existing_type=sa.String(), nullable=False)
    op.alter_column('users', 'username', existing_type=sa.String(), nullable=False)
