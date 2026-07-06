from pydantic import BaseModel
from typing import Optional

class GlossaryBase(BaseModel):
    term: str
    definition: Optional[str] = None
    technology_id: Optional[int] = None

class GlossaryCreate(GlossaryBase):
    pass

class GlossaryResponse(GlossaryBase):
    id: int

    class Config:
        from_attributes = True