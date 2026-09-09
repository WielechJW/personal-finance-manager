from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_user
from app.core.security import create_access_token, hash_password, verify_password
from app.db.session import get_db
from app.models.account import Account, AccountKind
from app.models.category import Category, CategoryType
from app.models.user import User
from app.schemas.auth import TokenResponse, UserLogin, UserRead, UserRegister

router = APIRouter(prefix="/auth", tags=["auth"])


def token_response(user: User) -> TokenResponse:
    return TokenResponse(access_token=create_access_token(user.id), user=UserRead.model_validate(user))


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def register(payload: UserRegister, db: Session = Depends(get_db)) -> TokenResponse:
    if db.scalar(select(User).where(User.email == payload.email)) is not None:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Użytkownik z tym adresem e-mail już istnieje.")

    user = User(email=payload.email, full_name=payload.full_name, password_hash=hash_password(payload.password))
    db.add(user)
    try:
        db.flush()
        db.add_all(
            [
                Account(user_id=user.id, name="Konto główne", kind=AccountKind.BANK, currency="PLN"),
                Account(user_id=user.id, name="Gotówka", kind=AccountKind.CASH, currency="PLN"),
                Category(user_id=user.id, name="Jedzenie", type=CategoryType.EXPENSE),
                Category(user_id=user.id, name="Transport", type=CategoryType.EXPENSE),
                Category(user_id=user.id, name="Pensja", type=CategoryType.INCOME),
            ]
        )
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Nie udało się utworzyć użytkownika.") from None
    db.refresh(user)
    return token_response(user)


@router.post("/login", response_model=TokenResponse)
def login(payload: UserLogin, db: Session = Depends(get_db)) -> TokenResponse:
    user = db.scalar(select(User).where(User.email == payload.email))
    if user is None or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Nieprawidłowy e-mail lub hasło.")
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Konto użytkownika jest nieaktywne.")
    return token_response(user)


@router.get("/me", response_model=UserRead)
def me(current_user: User = Depends(get_current_user)) -> User:
    return current_user
