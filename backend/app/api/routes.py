from datetime import date

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.account import Account
from app.models.category import Category, CategoryType
from app.models.transaction import TransactionType
from app.repositories.references import create_account, create_category, list_accounts, list_categories
from app.repositories.transactions import create_transaction, list_transactions
from app.schemas.reference import AccountCreate, AccountRead, CategoryCreate, CategoryRead
from app.schemas.transaction import FinancialSummary, TransactionCreate, TransactionRead
from app.services.summary import calculate_summary

router = APIRouter()


@router.get("/health", tags=["system"])
def healthcheck() -> dict[str, str]:
    return {"status": "ok"}


@router.get("/accounts", response_model=list[AccountRead], tags=["accounts"])
def get_accounts(db: Session = Depends(get_db)) -> list[AccountRead]:
    return list_accounts(db)


@router.post("/accounts", response_model=AccountRead, status_code=status.HTTP_201_CREATED, tags=["accounts"])
def add_account(payload: AccountCreate, db: Session = Depends(get_db)) -> AccountRead:
    return create_account(db, payload)


@router.get("/categories", response_model=list[CategoryRead], tags=["categories"])
def get_categories(
    transaction_type: CategoryType | None = Query(default=None), db: Session = Depends(get_db)
) -> list[CategoryRead]:
    return list_categories(db, transaction_type)


@router.post("/categories", response_model=CategoryRead, status_code=status.HTTP_201_CREATED, tags=["categories"])
def add_category(payload: CategoryCreate, db: Session = Depends(get_db)) -> CategoryRead:
    return create_category(db, payload)


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
    if db.get(Account, payload.account_id) is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Nie znaleziono konta.")

    if payload.category_id is not None:
        category = db.get(Category, payload.category_id)
        if category is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Nie znaleziono kategorii.")
        if category.type.value != payload.type.value:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
                detail="Typ kategorii musi odpowiadać typowi transakcji.",
            )
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
