"""create transactions table

Revision ID: 20260824_0001
Revises:
Create Date: 2026-08-24
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision = "20260824_0001"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # The type is created separately so a rerun after an interrupted initial
    # migration can safely reuse the PostgreSQL enum.
    transaction_type = postgresql.ENUM(
        "income", "expense", "transfer", name="transactiontype", create_type=False
    )
    transaction_type.create(op.get_bind(), checkfirst=True)
    op.create_table(
        "transactions",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("type", transaction_type, nullable=False),
        sa.Column("amount", sa.Numeric(14, 2), nullable=False),
        sa.Column("currency", sa.String(length=3), nullable=False, server_default="PLN"),
        sa.Column("description", sa.String(length=255), nullable=False),
        sa.Column("transaction_date", sa.Date(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index("ix_transactions_transaction_date", "transactions", ["transaction_date"])
    op.create_index("ix_transactions_type", "transactions", ["type"])


def downgrade() -> None:
    op.drop_index("ix_transactions_type", table_name="transactions")
    op.drop_index("ix_transactions_transaction_date", table_name="transactions")
    op.drop_table("transactions")
    postgresql.ENUM(name="transactiontype").drop(op.get_bind(), checkfirst=True)
