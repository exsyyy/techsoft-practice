from sqlalchemy import Column, Integer, String, Text
from app.core.database import Base

class Glossary(Base):
    __tablename__ = "glossary"
    id = Column(Integer, primary_key=True, index=True)
    term = Column(String(100), nullable=False, unique=True)
    definition = Column(Text, nullable=False)