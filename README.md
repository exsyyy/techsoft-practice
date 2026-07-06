# Информационная система "Цифровая оптимизация промышленных предприятий и складов"

Проект представляет собой информационную систему для публикации, поиска и анализа кейсов цифровой оптимизации заводов, складов и логистических центров.

---

## 1. Установка Docker

Для запуска проекта необходимо установить **Docker** по ссылке -> https://www.docker.com/products/docker-desktop/. Затем Docker нужно запустить.

### 2. Клонирование репозитория

```bash
git clone https://github.com/exsyyy/techsoft-practice
```

```bash
cd techsoft-practice
```

### 4. Запуск проекта в терминале внутри директории

```bash
docker-compose up -d --build
```

После запуска:

- **Backend (FastAPI)** — [http://localhost:8000](http://localhost:8000)
- **Swagger (документация API)** — [http://localhost:8000/docs](http://localhost:8000/docs)
- **PostgreSQL** — `localhost:5432`

---

## Импорт данных

Для импорта необходимо в папке backend создать папку data и внутри загрузить файл и назвать его export.csv
Затем при запущенном docker-compose выполнить команду

```bash
docker exec -it cases_backend python scripts/import_csv.py /app/data/export.csv
```

## Выключить систему

```bash
docker-compose down
```

## Технологический стек

| Компонент | Технология |
| :--- | :--- |
| **Backend** | FastAPI (Python) |
| **Frontend** | React + TypeScript + Tailwind CSS |
| **Database** | PostgreSQL |
| **ORM** | SQLAlchemy |
| **Migrations** | Alembic |
| **Containerization** | Docker, Docker Compose |

---



