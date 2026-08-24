from datetime import date

from sqlalchemy import Select, select
from sqlalchemy.orm import Session

from app.models.transaction import Transaction
from app.schemas.transaction import TransactionCreate


def create_transaction(db: Session, payload: TransactionCreate) -> Transaction:
    transaction = Transaction(**payload.model_dump())
    db.add(transaction)
    db.commit()
    db.refresh(transaction)
    return transaction


def list_transactions(db: Session, date_from: date | None, date_to: date | None) -> list[Transaction]:
    statement: Select[tuple[Transaction]] = select(Transaction)
    if date_from:
        statement = statement.where(Transaction.transaction_date >= date_from)
    if date_to:
        statement = statement.where(Transaction.transaction_date <= date_to)
    statement = statement.order_by(Transaction.transaction_date.desc(), Transaction.id.desc())
    return list(db.scalars(statement))
