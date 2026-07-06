from sqlalchemy import Column, Integer, String, Text, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base

class Glossary(Base):
    __tablename__ = "glossary"

    id = Column(Integer, primary_key=True, index=True)
    term = Column(String(200), nullable=False, unique=True)
    definition = Column(Text, nullable=True)
    technology_id = Column(Integer, ForeignKey("technologies.id", ondelete="SET NULL"), unique=True, nullable=True)

    technology = relationship("Technology", back_populates="glossary")