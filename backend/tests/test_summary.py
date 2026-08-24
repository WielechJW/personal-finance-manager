from dataclasses import dataclass
from decimal import Decimal

from app.models.transaction import TransactionType
from app.services.summary import calculate_summary


@dataclass
class Entry:
    type: TransactionType
    amount: Decimal


def test_transfer_does_not_change_financial_summary() -> None:
    income, expenses, balance = calculate_summary(
        [
            Entry(TransactionType.INCOME, Decimal("5000.00")),
            Entry(TransactionType.EXPENSE, Decimal("120.50")),
            Entry(TransactionType.TRANSFER, Decimal("400.00")),
        ]
    )

    assert income == Decimal("5000.00")
    assert expenses == Decimal("120.50")
    assert balance == Decimal("4879.50")
