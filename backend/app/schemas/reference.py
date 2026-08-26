from pydantic import BaseModel, ConfigDict, Field

from app.models.account import AccountKind
from app.models.category import CategoryType


class AccountCreate(BaseModel):
    name: str = Field(min_length=1, max_length=80)
    kind: AccountKind = AccountKind.BANK
    currency: str = Field(default="PLN", min_length=3, max_length=3)


class AccountRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    kind: AccountKind
    currency: str


class CategoryCreate(BaseModel):
    name: str = Field(min_length=1, max_length=80)
    type: CategoryType


class CategoryRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    type: CategoryType
