from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.account import Account
from app.models.category import Category, CategoryType
from app.schemas.reference import AccountCreate, CategoryCreate


def list_accounts(db: Session, user_id: int) -> list[Account]:
    return list(db.scalars(select(Account).where(Account.user_id == user_id).order_by(Account.name)))


def create_account(db: Session, payload: AccountCreate, user_id: int) -> Account:
    account = Account(**payload.model_dump(), user_id=user_id)
    db.add(account)
    db.commit()
    db.refresh(account)
    return account


def list_categories(db: Session, user_id: int, category_type: CategoryType | None = None) -> list[Category]:
    statement = select(Category).where(Category.user_id == user_id)
    if category_type:
        statement = statement.where(Category.type == category_type)
    return list(db.scalars(statement.order_by(Category.name)))


def create_category(db: Session, payload: CategoryCreate, user_id: int) -> Category:
    category = Category(**payload.model_dump(), user_id=user_id)
    db.add(category)
    db.commit()
    db.refresh(category)
    return category
