from sqlalchemy import Column, Integer, String, Text
from sqlalchemy.orm import relationship
from app.core.database import Base

class Technology(Base):
    __tablename__ = "technologies"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(500), nullable=False, unique=True)
    slug = Column(String(500), nullable=False, unique=True)
    description = Column(Text, nullable=True)
    icon = Column(String(50), nullable=True)
    
    cases = relationship("Case", secondary="case_technologies", back_populates="technologies")
    glossary = relationship("Glossary", back_populates="technology", uselist=False)