from pydantic import BaseModel
from typing import Optional

class TechnologyBase(BaseModel):
    name: str
    slug: str
    description: Optional[str] = None
    icon: Optional[str] = None

class TechnologyCreate(TechnologyBase):
    pass

class TechnologyResponse(TechnologyBase):
    id: int

    class Config:
        from_attributes = True