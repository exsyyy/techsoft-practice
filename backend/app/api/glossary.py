from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.models import Glossary
from pydantic import BaseModel

router = APIRouter(prefix="/api/glossary", tags=["glossary"])

class GlossaryItem(BaseModel):
    term: str
    definition: str

@router.get("/", response_model=List[GlossaryItem])
def get_glossary(db: Session = Depends(get_db)):
    return db.query(Glossary).all()