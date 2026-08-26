"""add accounts and categories

Revision ID: 20260826_0002
Revises: 20260824_0001
Create Date: 2026-08-26
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision = "20260826_0002"
down_revision = "20260824_0001"
branch_labels = None
depends_on = None


def upgrade() -> None:
    account_kind = postgresql.ENUM("bank", "cash", "savings", "card", name="accountkind", create_type=False)
    account_kind.create(op.get_bind(), checkfirst=True)
    category_type = postgresql.ENUM("income", "expense", name="categorytype", create_type=False)
    category_type.create(op.get_bind(), checkfirst=True)

    op.create_table(
        "accounts",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("name", sa.String(length=80), nullable=False),
        sa.Column("kind", account_kind, nullable=False),
        sa.Column("currency", sa.String(length=3), nullable=False),
        sa.UniqueConstraint("name"),
    )
    op.create_table(
        "categories",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("name", sa.String(length=80), nullable=False),
        sa.Column("type", category_type, nullable=False),
    )
    op.create_index("ix_categories_type", "categories", ["type"])
    op.add_column("transactions", sa.Column("account_id", sa.Integer(), nullable=True))
    op.add_column("transactions", sa.Column("category_id", sa.Integer(), nullable=True))
    op.create_foreign_key("fk_transactions_account", "transactions", "accounts", ["account_id"], ["id"], ondelete="RESTRICT")
    op.create_foreign_key("fk_transactions_category", "transactions", "categories", ["category_id"], ["id"], ondelete="RESTRICT")

    accounts = sa.table("accounts", sa.column("name", sa.String), sa.column("kind", account_kind), sa.column("currency", sa.String))
    categories = sa.table("categories", sa.column("name", sa.String), sa.column("type", category_type))
    op.bulk_insert(accounts, [{"name": "Konto główne", "kind": "bank", "currency": "PLN"}, {"name": "Gotówka", "kind": "cash", "currency": "PLN"}])
    op.bulk_insert(categories, [{"name": "Jedzenie", "type": "expense"}, {"name": "Transport", "type": "expense"}, {"name": "Pensja", "type": "income"}])


def downgrade() -> None:
    op.drop_constraint("fk_transactions_category", "transactions", type_="foreignkey")
    op.drop_constraint("fk_transactions_account", "transactions", type_="foreignkey")
    op.drop_column("transactions", "category_id")
    op.drop_column("transactions", "account_id")
    op.drop_index("ix_categories_type", table_name="categories")
    op.drop_table("categories")
    op.drop_table("accounts")
    postgresql.ENUM(name="categorytype").drop(op.get_bind(), checkfirst=True)
    postgresql.ENUM(name="accountkind").drop(op.get_bind(), checkfirst=True)
