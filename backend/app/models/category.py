from enum import Enum

from sqlalchemy import Enum as SqlEnum, String
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class CategoryType(str, Enum):
    INCOME = "income"
    EXPENSE = "expense"


class Category(Base):
    __tablename__ = "categories"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(80))
    type: Mapped[CategoryType] = mapped_column(
        SqlEnum(CategoryType, values_callable=lambda enum: [item.value for item in enum]), index=True
    )
