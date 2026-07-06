import sys
from pathlib import Path

sys.path.append(str(Path(__file__).parent.parent))

from app.core.database import SessionLocal
from app.models import Country, Technology, User, Case, CaseTechnology, CaseStatus, TrustLevel
from app.services.auth_service import get_password_hash
from datetime import datetime


def seed():
    db = SessionLocal()

    countries_data = [
        {"name": "Россия", "slug": "russia"},
        {"name": "Германия", "slug": "germany"},
        {"name": "Китай", "slug": "china"},
        {"name": "Япония", "slug": "japan"},
        {"name": "США", "slug": "usa"},
    ]

    for data in countries_data:
        country = db.query(Country).filter(Country.slug == data["slug"]).first()
        if not country:
            db.add(Country(**data))

    technologies_data = [
        {"name": "MES", "slug": "mes"},
        {"name": "WMS", "slug": "wms"},
        {"name": "ERP", "slug": "erp"},
        {"name": "IoT", "slug": "iot"},
        {"name": "RFID", "slug": "rfid"},
    ]

    for data in technologies_data:
        tech = db.query(Technology).filter(Technology.slug == data["slug"]).first()
        if not tech:
            db.add(Technology(**data))

    admin = db.query(User).filter(User.username == "admin").first()
    if not admin:
        admin = User(
            username="admin",
            email="admin@example.com",
            hashed_password=get_password_hash("admin123"),
            role="admin"
        )
        db.add(admin)

    db.flush()

    russia = db.query(Country).filter(Country.slug == "russia").first()
    mes = db.query(Technology).filter(Technology.slug == "mes").first()
    wms = db.query(Technology).filter(Technology.slug == "wms").first()

    if russia and mes and admin:
        existing = db.query(Case).filter(Case.title == "Внедрение MES и WMS на заводе").first()
        if not existing:
            case = Case(
                title="Внедрение MES и WMS на заводе",
                country_id=russia.id,
                company="ОАО Российский завод",
                industry="Машиностроение",
                facility_type="Завод",
                business_problem="Низкая прозрачность производства и склада",
                problem_description="Отсутствие оперативной информации о ходе производства, простои оборудования, проблемы с учётом на складе",
                it_systems="MES, WMS, SCADA",
                solution_description="Внедрены MES-система для сбора данных с оборудования и WMS для управления складом",
                implementation_stages="1. Аудит, 2. Установка, 3. Обучение, 4. Запуск",
                measurable_result="30",
                result_unit="%",
                result_period="6 месяцев",
                initial_value="0",
                final_value="30",
                limitations="Требуется стабильный интернет",
                applicability="Подходит для крупных заводов",
                source_url="https://example.com/case/1",
                source_type="Официальный отчет",
                trust_level=TrustLevel.A,
                source_date=datetime(2025, 1, 15),
                is_vendor_case=False,
                status=CaseStatus.PUBLISHED,
                author_id=admin.id,
                verification_date=datetime(2025, 2, 1),
                created_at=datetime(2025, 1, 1),
                updated_at=datetime(2025, 2, 1),
            )
            db.add(case)
            db.flush()

            if mes:
                db.add(CaseTechnology(case_id=case.id, technology_id=mes.id))
            if wms:
                db.add(CaseTechnology(case_id=case.id, technology_id=wms.id))

    db.commit()
    db.close()


if __name__ == "__main__":
    seed()