from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from enum import Enum
from app.schemas import TechnologyResponse 

class TrustLevel(str, Enum):
    A = "A"
    B = "B"
    C = "C"
    D = "D"

class CaseStatus(str, Enum):
    DRAFT = "draft"
    UNDER_REVIEW = "under_review"
    VERIFIED = "verified"
    PUBLISHED = "published"
    REJECTED = "rejected"

class CaseBase(BaseModel):
    title: str
    country_id: int
    company: str
    industry: str
    facility_type: str
    business_problem: str
    problem_description: str
    technology_ids: List[int] = []
    it_systems: Optional[str] = None
    solution_description: str
    implementation_stages: Optional[str] = None
    measurable_result: Optional[str] = None
    result_unit: Optional[str] = None
    result_period: Optional[str] = None
    initial_value: Optional[str] = None
    final_value: Optional[str] = None
    limitations: Optional[str] = None
    applicability: Optional[str] = None
    source_url: str
    source_type: str
    trust_level: TrustLevel
    source_date: Optional[datetime] = None
    is_vendor_case: bool = False

class CaseCreate(CaseBase):

    author_id: Optional[int] = None

class CaseUpdate(BaseModel):
    title: Optional[str] = None
    status: Optional[CaseStatus] = None
    verifier_id: Optional[int] = None
    verification_date: Optional[datetime] = None
    technology_ids: Optional[List[int]] = None
    company: Optional[str] = None
    industry: Optional[str] = None
    facility_type: Optional[str] = None
    business_problem: Optional[str] = None
    problem_description: Optional[str] = None
    it_systems: Optional[str] = None
    solution_description: Optional[str] = None
    implementation_stages: Optional[str] = None
    measurable_result: Optional[str] = None
    result_unit: Optional[str] = None
    result_period: Optional[str] = None
    initial_value: Optional[str] = None
    final_value: Optional[str] = None
    limitations: Optional[str] = None
    applicability: Optional[str] = None
    source_url: Optional[str] = None
    source_type: Optional[str] = None
    trust_level: Optional[TrustLevel] = None
    source_date: Optional[datetime] = None
    is_vendor_case: Optional[bool] = None

class CaseResponse(CaseBase):
    id: int
    status: CaseStatus
    author_id: int
    verifier_id: Optional[int] = None
    verification_date: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    technology_ids: List[int] = [] 
    technologies: Optional[List[TechnologyResponse]] = None


    class Config:
        from_attributes = True