from sqlalchemy import Column, Integer, String, Text, Float, DateTime, ForeignKey, JSON
from sqlalchemy.sql import func
from app.database.session import Base

class JobAnalysis(Base):
    __tablename__ = "job_analysis"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    job_title = Column(String, nullable=True)
    job_text = Column(Text, nullable=False)
    extracted_keywords = Column(JSON, nullable=True) # list of extracted skills/keywords
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class MatchResult(Base):
    __tablename__ = "match_results"

    id = Column(Integer, primary_key=True, index=True)
    resume_id = Column(Integer, ForeignKey("resumes.id", ondelete="CASCADE"), nullable=False)
    job_id = Column(Integer, ForeignKey("job_analysis.id", ondelete="CASCADE"), nullable=False)
    
    match_percentage = Column(Float, nullable=False)
    matching_skills = Column(JSON, nullable=True) # list of matching skills
    missing_skills = Column(JSON, nullable=True) # list of missing skills
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
