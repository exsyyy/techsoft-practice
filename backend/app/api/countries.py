from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.models import Country
from app.schemas import CountryResponse

router = APIRouter(prefix="/api/countries", tags=["countries"])

@router.get("/", response_model=List[CountryResponse])
def get_countries(db: Session = Depends(get_db)):
    return db.query(Country).all()