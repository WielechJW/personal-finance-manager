"""add transaction timestamp defaults

Revision ID: 20260909_0004
Revises: 20260909_0003
Create Date: 2026-09-09
"""

from alembic import op
import sqlalchemy as sa


revision = "20260909_0004"
down_revision = "20260909_0003"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.alter_column("transactions", "created_at", server_default=sa.func.now())
    op.alter_column("transactions", "updated_at", server_default=sa.func.now())


def downgrade() -> None:
    op.alter_column("transactions", "updated_at", server_default=None)
    op.alter_column("transactions", "created_at", server_default=None)
