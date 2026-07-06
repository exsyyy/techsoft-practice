from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    database_url: str
    secret_key: str = "your-secret-key-change-it"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    
    cors_origins: List[str] = ["http://localhost:3000", "http://localhost:3001","http://localhost:5173","http://localhost:5174","http://127.0.0.1:5173","http://127.0.0.1:5174","https://127.0.0.1:5174", ]

    app_name: str = "Цифровая оптимизация промышленных предприятий"
    app_version: str = "1.0.0"
    debug: bool = True

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"

settings = Settings()