from datetime import date, datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field, model_validator

from app.models.transaction import TransactionType


class TransactionCreate(BaseModel):
    account_id: int
    category_id: int | None = None
    type: TransactionType
    amount: Decimal = Field(gt=0, max_digits=14, decimal_places=2)
    description: str = Field(min_length=1, max_length=255)
    transaction_date: date
    currency: str = Field(default="PLN", min_length=3, max_length=3)

    @model_validator(mode="after")
    def validate_category(self) -> "TransactionCreate":
        if self.type in (TransactionType.INCOME, TransactionType.EXPENSE) and self.category_id is None:
            raise ValueError("Kategoria jest wymagana dla przychodu i wydatku.")
        if self.type == TransactionType.TRANSFER and self.category_id is not None:
            raise ValueError("Transfer nie może mieć kategorii.")
        return self


class TransactionRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    account_id: int | None
    category_id: int | None
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
