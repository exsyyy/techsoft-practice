from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api import cases_router, countries_router, technologies_router, auth_router, business_problems_router, glossary_router, stats_router, export_router  
import subprocess
import threading

def import_data():
    try:
        subprocess.run(
            ["python", "-u", "scripts/import_csv.py", "data/export.csv"],
            capture_output=False
        )
    except Exception as e:
        print(f"Ошибка импорта: {e}")

threading.Thread(target=import_data, daemon=True).start()

app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(cases_router)
app.include_router(countries_router)
app.include_router(technologies_router)
app.include_router(auth_router)
app.include_router(business_problems_router)
app.include_router(glossary_router)
app.include_router(stats_router)
app.include_router(export_router)


@app.get("/")
def root():
    return {
        "message": f"{settings.app_name} API is running",
        "version": settings.app_version,
        "docs": "/docs",
    }