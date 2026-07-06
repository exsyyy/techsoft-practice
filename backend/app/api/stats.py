from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
from app.core.database import get_db
from app.models import Case, Country, Technology

router = APIRouter(prefix="/api/stats", tags=["stats"])

@router.get("/api/stats")
def get_stats(db: Session = Depends(get_db)):
    total = db.query(Case).count()
    by_country = db.query(Country.name, func.count(Case.id)).join(Case).group_by(Country.id).all()

    by_technology = db.query(Technology.name, func.count(Case.id)).join(Case.technologies).group_by(Technology.id).all()
    
    return {
        "total_cases": total,
        "by_country": [{"name": c[0], "count": c[1]} for c in by_country],
        "by_technology": [{"name": t[0], "count": t[1]} for t in by_technology],
    }