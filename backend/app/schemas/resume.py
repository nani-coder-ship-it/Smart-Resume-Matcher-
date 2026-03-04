from typing import Optional, Dict, Any
from pydantic import BaseModel, ConfigDict
from datetime import datetime

class ResumeBase(BaseModel):
    filename: str

class ResumeCreate(ResumeBase):
    pass

class ResumeUpdate(ResumeBase):
    parsed_data: Optional[Dict[str, Any]] = None
    ats_score: Optional[float] = None
    status: Optional[str] = None

class ResumeInDBBase(ResumeBase):
    id: int
    user_id: int
    file_path: str
    status: str
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

class Resume(ResumeInDBBase):
    parsed_data: Optional[Dict[str, Any]] = None
    ats_score: Optional[float] = None
