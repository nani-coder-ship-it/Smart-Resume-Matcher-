from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.session import SessionLocal
from app.ai_engine.resume_optimizer import optimize_resume
from pydantic import BaseModel
from typing import Optional, List

router = APIRouter(prefix="/api/v1/resume-improve", tags=["resume-improvement"])

class ResumeImproveRequest(BaseModel):
    resume_id: int
    job_description: str
    job_title: Optional[str] = None

class ImprovedResumeResponse(BaseModel):
    ats_score: int
    matching_skills: List[str]
    missing_skills: List[str]
    suggestions: List[str]
    optimized_resume: str
    comparison: dict

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/optimize", response_model=ImprovedResumeResponse)
async def improve_resume(request: ResumeImproveRequest, db: Session = Depends(get_db)):
    """
    Analyze resume against job description and generate optimized version
    
    Steps:
    1. Fetch the resume from database
    2. Extract resume data and job requirements
    3. Compare and identify missing skills
    4. Generate improvement suggestions
    5. Return optimized resume content
    """
    from app.models.resume import Resume
    
    # Fetch resume
    resume = db.query(Resume).filter(Resume.id == request.resume_id).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    
    if not resume.parsed_data:
        raise HTTPException(status_code=400, detail="Resume has not been processed yet")
    
    # Optimize resume
    result = optimize_resume(resume.parsed_data, request.job_description)
    
    return ImprovedResumeResponse(
        ats_score=result["ats_score"],
        matching_skills=result["matching_skills"],
        missing_skills=result["missing_skills"],
        suggestions=result["suggestions"],
        optimized_resume=result["optimized_resume"],
        comparison=result["comparison"]
    )
