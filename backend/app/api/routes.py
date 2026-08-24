from datetime import date

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.repositories.transactions import create_transaction, list_transactions
from app.schemas.transaction import FinancialSummary, TransactionCreate, TransactionRead
from app.services.summary import calculate_summary

router = APIRouter()


@router.get("/health", tags=["system"])
def healthcheck() -> dict[str, str]:
    return {"status": "ok"}


@router.get("/transactions", response_model=list[TransactionRead], tags=["transactions"])
def get_transactions(
    date_from: date | None = Query(default=None),
    date_to: date | None = Query(default=None),
    db: Session = Depends(get_db),
) -> list[TransactionRead]:
    return list_transactions(db, date_from, date_to)


@router.post(
    "/transactions",
    response_model=TransactionRead,
    status_code=status.HTTP_201_CREATED,
    tags=["transactions"],
)
def add_transaction(payload: TransactionCreate, db: Session = Depends(get_db)) -> TransactionRead:
    return create_transaction(db, payload)


@router.get("/dashboard/summary", response_model=FinancialSummary, tags=["dashboard"])
def get_dashboard_summary(
    date_from: date | None = Query(default=None),
    date_to: date | None = Query(default=None),
    db: Session = Depends(get_db),
) -> FinancialSummary:
    income, expenses, balance = calculate_summary(list_transactions(db, date_from, date_to))
    return FinancialSummary(
        income=income,
        expenses=expenses,
        balance=balance,
        date_from=date_from,
        date_to=date_to,
    )
