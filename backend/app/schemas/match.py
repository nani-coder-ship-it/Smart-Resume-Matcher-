from typing import Optional, List, Dict, Any
from pydantic import BaseModel, ConfigDict
from datetime import datetime

class JobAnalysisBase(BaseModel):
    job_text: str
    job_title: Optional[str] = None

class JobAnalysisCreate(JobAnalysisBase):
    pass

class JobAnalysisInDBBase(JobAnalysisBase):
    id: int
    user_id: int
    extracted_keywords: List[str] = []
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class JobAnalysis(JobAnalysisInDBBase):
    pass

class MatchResultBase(BaseModel):
    resume_id: int
    job_id: int

class MatchResultCreate(MatchResultBase):
    pass

class MatchResultInDBBase(MatchResultBase):
    id: int
    match_percentage: float
    matching_skills: List[str] = []
    missing_skills: List[str] = []
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class MatchResult(MatchResultInDBBase):
    pass
