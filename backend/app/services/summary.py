from collections.abc import Iterable
from decimal import Decimal
from typing import Protocol

from app.models.transaction import TransactionType


class TransactionLike(Protocol):
    type: TransactionType
    amount: Decimal


def calculate_summary(transactions: Iterable[TransactionLike]) -> tuple[Decimal, Decimal, Decimal]:
    """Return income, expenses and balance; transfers intentionally have no impact."""
    income = Decimal("0.00")
    expenses = Decimal("0.00")
    for transaction in transactions:
        if transaction.type == TransactionType.INCOME:
            income += transaction.amount
        elif transaction.type == TransactionType.EXPENSE:
            expenses += transaction.amount
    return income, expenses, income - expenses
