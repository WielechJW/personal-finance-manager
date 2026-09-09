from app.core.security import create_access_token, decode_access_token, hash_password, verify_password


def test_password_is_hashed_and_can_be_verified() -> None:
    password = "BezpieczneHaslo123!"
    hashed = hash_password(password)

    assert hashed != password
    assert verify_password(password, hashed)
    assert not verify_password("inne-haslo", hashed)


def test_access_token_contains_user_id() -> None:
    token = create_access_token(42)

    assert decode_access_token(token) == 42
