from sqlalchemy.orm import Session
from typing import List, Optional
from app.models import Technology

def get_technologies(db: Session) -> List[Technology]:
    return db.query(Technology).all()

def get_technology_by_id(db: Session, technology_id: int) -> Optional[Technology]:
    return db.query(Technology).filter(Technology.id == technology_id).first()