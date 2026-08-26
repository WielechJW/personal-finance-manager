from enum import Enum

from sqlalchemy import Enum as SqlEnum, String
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class AccountKind(str, Enum):
    BANK = "bank"
    CASH = "cash"
    SAVINGS = "savings"
    CARD = "card"


class Account(Base):
    __tablename__ = "accounts"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(80), unique=True)
    kind: Mapped[AccountKind] = mapped_column(
        SqlEnum(AccountKind, values_callable=lambda enum: [item.value for item in enum]),
        default=AccountKind.BANK,
    )
    currency: Mapped[str] = mapped_column(String(3), default="PLN")
