import csv
import sys
import argparse
from pathlib import Path
from datetime import datetime

sys.path.append(str(Path(__file__).parent.parent))

from app.core.database import SessionLocal
from app.models import (
    Case, CaseStatus, CaseTechnology, Country,
    Technology, User, TrustLevel
)
from app.services.auth_service import get_password_hash


def get_or_create_country(db, name):
    if not name or not name.strip():
        return None
    name = name.strip()
    country = db.query(Country).filter(Country.name == name).first()
    if not country:
        slug = name.lower().replace(" ", "-").replace("(", "").replace(")", "")
        country = Country(name=name, slug=slug)
        db.add(country)
        db.flush()
        print(f"Создана страна: {name}")
    return country


def get_or_create_technology(db, name):
    if not name or not name.strip():
        return None
    name = name.strip()
    tech = db.query(Technology).filter(Technology.name == name).first()
    if not tech:
        slug = name.lower().replace(" ", "-").replace("(", "").replace(")", "")[:100]
        tech = Technology(name=name, slug=slug)
        db.add(tech)
        db.flush()
        print(f"Создана технология: {name}")
    return tech


def get_or_create_user(db, name):
    if not name or not name.strip():
        return None
    name = name.strip()
    user = db.query(User).filter(User.username == name).first()
    if not user:
        user = User(
            username=name,
            email=f"{name.replace(' ', '.').lower()}@example.com",
            hashed_password=get_password_hash("temp123"),
            role="editor"
        )
        db.add(user)
        db.flush()
        print(f"Создан пользователь: {name}")
    return user


def parse_status(status_str):
    if not status_str:
        return CaseStatus.DRAFT
    status_map = {
        "черновик": CaseStatus.DRAFT,
        "на проверке": CaseStatus.UNDER_REVIEW,
        "проверен": CaseStatus.PUBLISHED,
        "опубликован": CaseStatus.PUBLISHED,
        "отклонен": CaseStatus.REJECTED,
        "исправлено": CaseStatus.PUBLISHED,
        "поправлен": CaseStatus.PUBLISHED,
    }
    return status_map.get(status_str.strip().lower(), CaseStatus.DRAFT)


def parse_trust_level(level_str):
    if not level_str:
        return TrustLevel.C
    level_map = {
        "А": TrustLevel.A,
        "A": TrustLevel.A,
        "В": TrustLevel.B,
        "B": TrustLevel.B,
        "С": TrustLevel.C,
        "C": TrustLevel.C,
        "D": TrustLevel.D,
    }
    return level_map.get(level_str.strip().upper(), TrustLevel.C)


def parse_date(date_str):
    if not date_str or date_str.strip() == "":
        return None
    try:
        return datetime.strptime(date_str.strip(), "%Y-%m-%d")
    except ValueError:
        return None


def parse_technologies(tech_str):
    if not tech_str:
        return []
    raw = tech_str.strip()
    if ";" in raw:
        items = [t.strip() for t in raw.split(";") if t.strip()]
    elif "," in raw:
        items = [t.strip() for t in raw.split(",") if t.strip()]
    else:
        items = [raw]
    return items


def import_cases(csv_path):
    db = SessionLocal()
    
    if not Path(csv_path).exists():
        print(f"Файл не найден: {csv_path}")
        return
    
    print(f"Загружаю файл: {csv_path}")
    
    with open(csv_path, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        rows = list(reader)
    
    print(f"Найдено {len(rows)} строк")
    
    imported = 0
    skipped = 0
    
    for i, row in enumerate(rows, 1):
        title = row.get("название кейса", "").strip()
        if not title:
            print(f"Строка {i}: пропущена (нет названия)")
            skipped += 1
            continue
        
        country_name = row.get("страна", "").strip()
        if not country_name:
            print(f"Строка {i}: пропущена (нет страны)")
            skipped += 1
            continue
        
        existing = db.query(Case).filter(Case.title == title).first()
        if existing:
            print(f"⏭Строка {i}: кейс уже существует: {title[:50]}...")
            skipped += 1
            continue
        
        country = get_or_create_country(db, country_name)
        if not country:
            print(f"Строка {i}: не удалось создать страну {country_name}")
            skipped += 1
            continue
        
        author_name = row.get("автор карточки", "").strip()
        author = get_or_create_user(db, author_name) if author_name else None
        
        verifier_name = row.get("проверяющий участник", "").strip()
        verifier = get_or_create_user(db, verifier_name) if verifier_name else None
        
        case = Case(
            title=title,
            country_id=country.id,
            company=row.get("компания или предприятие", "").strip(),
            industry=row.get("отрасль", "").strip(),
            facility_type=row.get("тип объекта внедрения", "").strip(),
            business_problem=row.get("категория бизнес-проблемы", "").strip(),
            problem_description=row.get("подробное описание исходной проблемы", "").strip(),
            it_systems=row.get("использованные IT-системы", "").strip(),
            solution_description=row.get("описание внедренного решения", "").strip(),
            implementation_stages=row.get("этапы внедрения, если информация доступна", "").strip(),
            measurable_result=row.get("измеримый результат", "").strip(),
            result_unit=row.get("единица измерения результата", "").strip(),
            result_period=row.get("период измерения результата, если он известен", "").strip(),
            initial_value=row.get("исходное значение показателя, если они опубликованы", "").strip(),
            final_value=row.get("итоговое значение показателя, если они опубликованы", "").strip(),
            limitations=row.get("ограничения и риски внедрения", "").strip(),
            applicability=row.get("применимость решения для других предприятий", "").strip(),
            source_url=row.get("ссылка на источник", "").strip(),
            source_type=row.get("тип источника", "").strip(),
            trust_level=parse_trust_level(row.get("уровень достоверности источника", "").strip()),
            source_date=parse_date(row.get("дата публикации источника", "").strip()),
            verification_date=parse_date(row.get("дата проверки информации", "").strip()),
            is_vendor_case=False,
            status=parse_status(row.get("статус верификации", "").strip()),
            author_id=author.id if author else None,
            verifier_id=verifier.id if verifier else None,
        )
        
        db.add(case)
        db.flush()
        
        tech_str = row.get("примененная технология или методика", "").strip()
        tech_names = parse_technologies(tech_str)
        
        for tech_name in tech_names:
            tech = get_or_create_technology(db, tech_name)
            if tech:
                ct = CaseTechnology(case_id=case.id, technology_id=tech.id)
                db.add(ct)
        
        imported += 1
        print(f" Строка {i}: импортирован '{title[:50]}...'")
    
    db.commit()
    print(f"\n Импорт завершён!")
    print(f"   Импортировано: {imported}")
    print(f"   Пропущено: {skipped}")
    print(f"   Всего строк: {len(rows)}")
    db.close()


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Импорт кейсов из CSV")
    parser.add_argument("csv_file", help="Путь к CSV файлу")
    args = parser.parse_args()
    
    import_cases(args.csv_file)