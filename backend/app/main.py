from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api import cases_router, countries_router, technologies_router, auth_router, business_problems_router, glossary_router  

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


@app.get("/")
def root():
    return {
        "message": f"{settings.app_name} API is running",
        "version": settings.app_version,
        "docs": "/docs",
    }