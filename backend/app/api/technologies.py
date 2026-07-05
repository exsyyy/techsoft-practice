from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.models import Technology
from app.schemas import TechnologyResponse

router = APIRouter(prefix="/api/technologies", tags=["technologies"])

@router.get("/", response_model=List[TechnologyResponse])
def get_technologies(db: Session = Depends(get_db)):
    return db.query(Technology).all()