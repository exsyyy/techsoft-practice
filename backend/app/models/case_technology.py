from sqlalchemy import Column, Integer, ForeignKey, UniqueConstraint
from app.core.database import Base

class CaseTechnology(Base):
    __tablename__ = "case_technologies"
    
    id = Column(Integer, primary_key=True, index=True)
    case_id = Column(Integer, ForeignKey("cases.id", ondelete="CASCADE"), nullable=False)
    technology_id = Column(Integer, ForeignKey("technologies.id", ondelete="CASCADE"), nullable=False)
    
    __table_args__ = (UniqueConstraint("case_id", "technology_id"),)