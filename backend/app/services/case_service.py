from sqlalchemy.orm import Session, joinedload
from sqlalchemy import or_, desc, asc
from typing import Optional, List
from app.models import Case, Country, Technology, User, CaseTechnology
from app.schemas import CaseCreate, CaseUpdate

def get_cases(
    db: Session,
    country: Optional[str] = None,
    industry: Optional[str] = None,
    facility_type: Optional[str] = None,
    technology: Optional[str] = None,
    trust_level: Optional[str] = None,
    has_quantitative_result: Optional[bool] = None,
    source_type: Optional[str] = None,
    search: Optional[str] = None,
    status: Optional[str] = None,
    sort_by: str = "created_at",
    order: str = "desc",
    skip: int = 0,
    limit: int = 20,
) -> List[Case]:
    
    query = db.query(Case).options(
        joinedload(Case.country),
        joinedload(Case.technologies),
        joinedload(Case.author),
        joinedload(Case.verifier),
    )
    
    # --- фильтры ---
    if country:
        query = query.join(Country).filter(Country.name == country)
    if technology:
        query = query.join(Case.technologies).filter(Technology.name == technology)
    if industry:
        query = query.filter(Case.industry == industry)
    if facility_type:
        query = query.filter(Case.facility_type == facility_type)
    if trust_level:
        query = query.filter(Case.trust_level == trust_level)
    if source_type:
        query = query.filter(Case.source_type == source_type)
    if status:
        query = query.filter(Case.status == status)
    if has_quantitative_result is not None:
        if has_quantitative_result:
            query = query.filter(Case.measurable_result.isnot(None))
        else:
            query = query.filter(Case.measurable_result.is_(None))
    
    # --- поиск ---
    if search:
        query = query.filter(
            or_(
                Case.title.ilike(f"%{search}%"),
                Case.problem_description.ilike(f"%{search}%"),
                Case.solution_description.ilike(f"%{search}%"),
                Case.company.ilike(f"%{search}%"),
            )
        )
    
    # --- сортировка ---
    sort_mapping = {
        "created_at": Case.created_at,
        "updated_at": Case.updated_at,
        "verification_date": Case.verification_date,
        "trust_level": Case.trust_level,
        "country": Country.name,
    }
    sort_field = sort_mapping.get(sort_by, Case.created_at)
    
    if sort_by == "country" and not country:
        query = query.join(Country)
    if sort_by == "technology" and not technology:
        query = query.join(Case.technologies).join(Technology)
        sort_field = Technology.name
    elif sort_by == "technology":
        query = query.join(Case.technologies).join(Technology)
        sort_field = Technology.name
    
    if order == "desc":
        query = query.order_by(desc(sort_field))
    else:
        query = query.order_by(asc(sort_field))
    
    # --- пагинация ---
    return query.offset(skip).limit(limit).all()


def get_case_by_id(db: Session, case_id: int) -> Optional[Case]:
    return db.query(Case).options(
        joinedload(Case.country),
        joinedload(Case.technologies),
        joinedload(Case.author),
        joinedload(Case.verifier),
    ).filter(Case.id == case_id).first()


def create_case(db: Session, case_data: CaseCreate) -> Case:

    tech_ids = case_data.technology_ids
    case_dict = case_data.model_dump(exclude={"technology_ids"})
    
    case = Case(**case_dict)
    db.add(case)
    
    for tech_id in tech_ids:
        db.add(CaseTechnology(case_id=case.id, technology_id=tech_id))
    
    db.commit()
    db.refresh(case)
    return case

def update_case(db: Session, case_id: int, case_data: CaseUpdate) -> Optional[Case]:
    case = db.query(Case).filter(Case.id == case_id).first()

    if not case:
        return None
    
    update_data = case_data.model_dump(exclude_unset=True, exclude={"technology_ids"})
    for key, value in update_data.items():
        setattr(case, key, value)
    
    if case_data.technology_ids is not None:
        db.query(CaseTechnology).filter(CaseTechnology.case_id == case_id).delete()
        for tech_id in case_data.technology_ids:
            db.add(CaseTechnology(case_id=case_id, technology_id=tech_id))
    
    db.commit()
    db.refresh(case)
    return case


def delete_case(db: Session, case_id: int) -> bool:
    case = db.query(Case).filter(Case.id == case_id).first()
    if not case:
        return False
    db.delete(case)
    db.commit()
    return True