from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.models import Case

router = APIRouter(prefix="/api/business-problems", tags=["business-problems"])

@router.get("/", response_model=List[str])
def get_business_problems(db: Session = Depends(get_db)):
    problems = db.query(Case.business_problem).distinct().all()
    return [p[0] for p in problems if p[0]]