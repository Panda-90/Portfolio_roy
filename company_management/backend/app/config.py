import os
from pydantic_settings import BaseSettings

class Settings:
    PROJECT_NAME: str = "Company Management System"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "super-secret-college-lab-key-2026-change-in-prod")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./company.db")

settings = Settings()
