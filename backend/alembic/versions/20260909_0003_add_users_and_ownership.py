"""add users and data ownership

Revision ID: 20260909_0003
Revises: 20260826_0002
Create Date: 2026-09-09
"""

from alembic import op
import sqlalchemy as sa


revision = "20260909_0003"
down_revision = "20260826_0002"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "users",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("email", sa.String(length=320), nullable=False),
        sa.Column("full_name", sa.String(length=80), nullable=False),
        sa.Column("password_hash", sa.String(length=255), nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )
    op.create_index("ix_users_email", "users", ["email"], unique=True)

    op.add_column("accounts", sa.Column("user_id", sa.Integer(), nullable=True))
    op.add_column("categories", sa.Column("user_id", sa.Integer(), nullable=True))
    op.add_column("transactions", sa.Column("user_id", sa.Integer(), nullable=True))
    op.create_index("ix_accounts_user_id", "accounts", ["user_id"])
    op.create_index("ix_categories_user_id", "categories", ["user_id"])
    op.create_index("ix_transactions_user_id", "transactions", ["user_id"])
    op.create_foreign_key("fk_accounts_user", "accounts", "users", ["user_id"], ["id"], ondelete="CASCADE")
    op.create_foreign_key("fk_categories_user", "categories", "users", ["user_id"], ["id"], ondelete="CASCADE")
    op.create_foreign_key("fk_transactions_user", "transactions", "users", ["user_id"], ["id"], ondelete="CASCADE")
    op.drop_constraint("accounts_name_key", "accounts", type_="unique")
    op.create_unique_constraint("uq_accounts_user_name", "accounts", ["user_id", "name"])


def downgrade() -> None:
    op.drop_constraint("uq_accounts_user_name", "accounts", type_="unique")
    op.create_unique_constraint("accounts_name_key", "accounts", ["name"])
    op.drop_constraint("fk_transactions_user", "transactions", type_="foreignkey")
    op.drop_constraint("fk_categories_user", "categories", type_="foreignkey")
    op.drop_constraint("fk_accounts_user", "accounts", type_="foreignkey")
    op.drop_index("ix_transactions_user_id", table_name="transactions")
    op.drop_index("ix_categories_user_id", table_name="categories")
    op.drop_index("ix_accounts_user_id", table_name="accounts")
    op.drop_column("transactions", "user_id")
    op.drop_column("categories", "user_id")
    op.drop_column("accounts", "user_id")
    op.drop_index("ix_users_email", table_name="users")
    op.drop_table("users")
