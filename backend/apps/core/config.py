# apps/core/config.py
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import AnyHttpUrl, field_validator
from typing import List, Union


class Settings(BaseSettings):
    # --- Required ---
    API_PREFIX: str = "/api"

    @property
    def cors_list(self) -> List[str]:
        return [x.strip() for x in self.CORS_ORIGINS.split(",") if x.strip()]
    DB_URL: str
    JWT_SECRET: str

    # --- Optional / Nice-to-have ---
    REDIS_URL: str | None = None

    # Accept either a single URL or a comma-separated list
    CORS_ORIGINS: Union[str, List[AnyHttpUrl]] = "http://localhost:3000"

    # Uvicorn / env
    ENV: str = "dev"

    # SMTP Settings
    MAIL_USERNAME: str | None = None
    MAIL_PASSWORD: str | None = None
    MAIL_FROM: str | None = None
    MAIL_PORT: int = 587
    MAIL_SERVER: str | None = None
    MAIL_FROM_NAME: str = "AutoServe360"

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    @field_validator("CORS_ORIGINS")
    @classmethod
    def split_cors(cls, v):
        """
        Allow: 
        - "http://localhost:3000"
        - "http://localhost:3000,http://127.0.0.1:3000,https://your-domain.com"
        - ["http://localhost:3000", "https://your-domain.com"]
        """
        if isinstance(v, list):
            return v
        if isinstance(v, str):
            parts = [s.strip() for s in v.split(",") if s.strip()]
            return parts
        return v

    # Back-compat for legacy code that used `settings.cors_list`
    @property
    def cors_list(self) -> List[str]:
        # CORS_ORIGINS is already normalized to a list by split_cors()
        if isinstance(self.CORS_ORIGINS, list):
            return [str(x) for x in self.CORS_ORIGINS]
        return [str(self.CORS_ORIGINS)]


settings = Settings()
