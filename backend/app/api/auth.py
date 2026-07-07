from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm

# Импорты SQLAlchemy и моделей БД для пользователей нам больше не нужны
# from sqlalchemy.orm import Session
# from app.core.database import get_db
# from app.models import User
# from app.schemas import UserCreate, UserResponse

from app.services import auth_service
from app.schemas import Token

router = APIRouter(prefix="/api/auth", tags=["auth"])
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")


# ======= НАШИ ЖЕСТКО ПРОПИСАННЫЕ ЛОГИНЫ И ПАРОЛИ =======
HARDCODED_CREDENTIALS = {
    "admin_user": "techsoftadmin",    # Роль: admin
    "editor_user": "techsofteditor"   # Роль: editor
}
# =======================================================


# Эндпоинт /register мы отключаем или убираем, так как регистрировать в БД некого
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

    # 1. Сверяем введенные данные с нашим словарем в коде
    if username not in HARDCODED_CREDENTIALS or HARDCODED_CREDENTIALS[username] != password:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Неверное имя пользователя или пароль",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # 2. Определяем роль на ходу для записи в токен
    role = "admin" if username == "admin_user" else "editor"

    # 3. Генерируем стандартный токен через твой auth_service
    # Мы передаем те же данные, что и раньше, чтобы ничего не сломалось в твоем сервисе
    access_token = auth_service.create_access_token(
        data={"sub": username, "role": role},
        expires_delta=timedelta(minutes=30)
    )

    return {"access_token": access_token, "token_type": "bearer"}