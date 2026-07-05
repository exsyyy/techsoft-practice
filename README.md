# Информационная система "Цифровая оптимизация промышленных предприятий и складов"

Проект представляет собой информационную систему для публикации, поиска и анализа кейсов цифровой оптимизации заводов, складов и логистических центров.

---

## 🚀 Быстрый старт

Для запуска проекта необходим **Docker**.

### 1. Клонировать репозиторий

```bash
git clone https://github.com/Deniskc/practiceSiteRepo.git
cd practiceSiteRepo/techsoft-practice
```

### 2. Запустить проект

```bash
docker-compose up -d --build
```

После запуска:

- **Backend (FastAPI)** — [http://localhost:8000](http://localhost:8000)
- **Swagger (документация API)** — [http://localhost:8000/docs](http://localhost:8000/docs)
- **PostgreSQL** — `localhost:5432`

---

## 🛑 Остановка и управление

```bash
# Остановить все контейнеры
docker-compose down

# Остановить и удалить все данные (базу данных)
docker-compose down -v
```

## 🛠️ Технологический стек

| Компонент | Технология |
| :--- | :--- |
| **Backend** | FastAPI (Python) |
| **Frontend** | Next.js + TypeScript + Tailwind CSS |
| **Database** | PostgreSQL |
| **ORM** | SQLAlchemy |
| **Migrations** | Alembic |
| **Containerization** | Docker, Docker Compose |

---

