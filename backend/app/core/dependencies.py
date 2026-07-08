from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from app.services.auth_service import verify_token
import logging

# Настройка логов для отладки
logger = logging.getLogger(__name__)

# Токен берется из заголовка Authorization
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

def get_current_user(token: str = Depends(oauth2_scheme)) -> dict:
    """
    Проверяет токен и возвращает данные пользователя прямо из JWT-пейлоада.
    БД больше не используется, так как пользователи захардкожены.
    """
    payload = verify_token(token)
    if not payload:
        logger.error("Token verification failed")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Возвращаем словарь с данными пользователя из токена
    return {
        "username": payload.get("sub"),
        "role": payload.get("role", "editor")
    }

def get_current_admin(current_user: dict = Depends(get_current_user)) -> dict:
    """
    Проверяет роль из словаря, полученного в get_current_user.
    """
    if current_user.get("role") != "admin":
        logger.warning(f"Access denied for user {current_user.get('username')} with role {current_user.get('role')}")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    return current_user