from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    database_url: str = "postgresql+psycopg://finance_user:finance_password@db:5432/finance_app"
    backend_cors_origins: str = "http://localhost:5173"
    auth_secret_key: str = "local-development-secret-change-before-deploying"
    auth_token_expire_minutes: int = 1440

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    @property
    def cors_origins(self) -> list[str]:
        return [origin.strip() for origin in self.backend_cors_origins.split(",") if origin.strip()]


settings = Settings()
