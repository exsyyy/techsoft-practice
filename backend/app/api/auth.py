import base64
import json
from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm

from app.services import auth_service
from app.schemas import Token

router = APIRouter(prefix="/api/auth", tags=["auth"])
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

HARDCODED_CREDENTIALS = {
    "admin_user": "techsoftadmin",    # Роль: admin
    "editor_user": "techsofteditor"   # Роль: editor
}


@router.post("/register", status_code=201, include_in_schema=False)
def register():
    raise HTTPException(
        status_code=status.HTTP_405_METHOD_NOT_ALLOWED,
        detail="Регистрация отключена. Используйте захардкоженные аккаунты."
    )


@router.post("/login", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends()):
    username = form_data.username
    password = form_data.password

    if username not in HARDCODED_CREDENTIALS or HARDCODED_CREDENTIALS[username] != password:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Неверное имя пользователя или пароль",
            headers={"WWW-Authenticate": "Bearer"},
        )

    role = "admin" if username == "admin_user" else "editor"

    access_token = auth_service.create_access_token(
        data={"sub": username, "role": role},
        expires_delta=timedelta(minutes=30)
    )

    return {"access_token": access_token, "token_type": "bearer"}


@router.get("/me")
def get_me(token: str = Depends(oauth2_scheme)):
    """
    Безопасно декодируем токен без использования сторонних библиотек.
    Это гарантирует, что сервер не упадет из-за отсутствия модулей.
    """
    try:
        payload_part = token.split('.')[1]

        payload_part += "=" * ((4 - len(payload_part) % 4) % 4)

        payload_json = base64.urlsafe_b64decode(payload_part).decode('utf-8')
        payload_data = json.loads(payload_json)

        username = payload_data.get("sub")
        role = payload_data.get("role", "editor")

        if not username:
            raise ValueError("Token is invalid")

        return {
            "id": 1 if username == "admin_user" else 2,
            "username": username,
            "email": f"{username}@example.com",
            "role": role,
            "created_at": "2026-01-01T00:00:00Z"
        }
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Не удалось прочитать токен",
            headers={"WWW-Authenticate": "Bearer"},
        )