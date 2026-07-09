from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    database_url: str
    secret_key: str = "your-secret-key-change-it"
    algorithm: str = "HS256"

    # 1. Настраиваем время жизни токена (480 минут = 8 часов)
    access_token_expire_minutes: int = 480

    # 2. Добавляем адрес вашего фронтенда в список разрешенных
    cors_origins: List[str] = [
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
        "https://127.0.0.1:5174",
        "https://techsoftback-denisdenisdenis.amvera.io"
        "https://techsoftfrtd-denisdenisdenis.amvera.io",
        "*"  # Символ "*" разрешает запросы с любых сайтов (полезно для быстрого запуска и тестов)
    ]

    app_name: str = "Цифровая оптимизация промышленных предприятий"
    app_version: str = "1.0.0"
    debug: bool = True

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"

settings = Settings()