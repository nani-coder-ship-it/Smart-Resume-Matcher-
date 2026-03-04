from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, JSON
from sqlalchemy.sql import func
from app.database.session import Base

class Resume(Base):
    __tablename__ = "resumes"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    filename = Column(String, nullable=False)
    file_path = Column(String, nullable=False)
    
    # Store extracted information as JSON
    parsed_data = Column(JSON, nullable=True) 
    
    # ATS calculation score (0.0 to 100.0)
    ats_score = Column(Float, nullable=True) 
    
    # Processing status ("pending", "processing", "completed", "failed")
    status = Column(String, default="pending") 
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
