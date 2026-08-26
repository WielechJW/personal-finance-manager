from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.account import Account
from app.models.category import Category, CategoryType
from app.schemas.reference import AccountCreate, CategoryCreate


def list_accounts(db: Session) -> list[Account]:
    return list(db.scalars(select(Account).order_by(Account.name)))


def create_account(db: Session, payload: AccountCreate) -> Account:
    account = Account(**payload.model_dump())
    db.add(account)
    db.commit()
    db.refresh(account)
    return account


def list_categories(db: Session, category_type: CategoryType | None = None) -> list[Category]:
    statement = select(Category)
    if category_type:
        statement = statement.where(Category.type == category_type)
    return list(db.scalars(statement.order_by(Category.name)))


def create_category(db: Session, payload: CategoryCreate) -> Category:
    category = Category(**payload.model_dump())
    db.add(category)
    db.commit()
    db.refresh(category)
    return category
