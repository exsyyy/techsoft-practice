from sqlalchemy.orm import Session
from typing import List, Optional
from app.models import Country

def get_countries(db: Session) -> List[Country]:
    return db.query(Country).all()

def get_country_by_id(db: Session, country_id: int) -> Optional[Country]:
    return db.query(Country).filter(Country.id == country_id).first()