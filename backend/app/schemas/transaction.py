from datetime import date, datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field

from app.models.transaction import TransactionType


class TransactionCreate(BaseModel):
    type: TransactionType
    amount: Decimal = Field(gt=0, max_digits=14, decimal_places=2)
    description: str = Field(min_length=1, max_length=255)
    transaction_date: date
    currency: str = Field(default="PLN", min_length=3, max_length=3)


class TransactionRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    type: TransactionType
    amount: Decimal
    currency: str
    description: str
    transaction_date: date
    created_at: datetime


class FinancialSummary(BaseModel):
    income: Decimal
    expenses: Decimal
    balance: Decimal
    date_from: date | None
    date_to: date | None
