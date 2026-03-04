from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api import deps
from app.models.user import User
from app.models.resume import Resume
from app.models.match import JobAnalysis, MatchResult
from app.schemas.match import JobAnalysisCreate, JobAnalysis as JobAnalysisSchema
from app.schemas.match import MatchResult as MatchResultSchema
from app.ai_engine.job_matcher import analyze_job_description, calculate_match

router = APIRouter()

@router.post("/analyze", response_model=JobAnalysisSchema)
def analyze_job(
    *,
    db: Session = Depends(deps.get_db),
    job_in: JobAnalysisCreate,
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
    """
    Extract skills from a Job Description.
    """
    extracted_skills = analyze_job_description(job_in.job_text)
    
    job_record = JobAnalysis(
        user_id=current_user.id,
        job_title=job_in.job_title,
        job_text=job_in.job_text,
        extracted_keywords=extracted_skills
    )
    db.add(job_record)
    db.commit()
    db.refresh(job_record)
    
    return job_record

@router.post("/match/{resume_id}/{job_id}", response_model=MatchResultSchema)
def match_resume_to_job(
    *,
    resume_id: int,
    job_id: int,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
    """
    Compare an uploaded Resume against a previously analyzed Job Description.
    """
    resume = db.query(Resume).filter(Resume.id == resume_id, Resume.user_id == current_user.id).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
        
    if not resume.parsed_data:
        raise HTTPException(status_code=400, detail="Resume not finished processing yet")
        
    job = db.query(JobAnalysis).filter(JobAnalysis.id == job_id, JobAnalysis.user_id == current_user.id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job Analysis not found")

    resume_skills = resume.parsed_data.get("skills", [])
    job_skills = job.extracted_keywords or []
    
    results = calculate_match(resume_skills, job_skills)
    
    match_record = MatchResult(
        resume_id=resume.id,
        job_id=job.id,
        match_percentage=results["match_percentage"],
        matching_skills=results["matching_skills"],
        missing_skills=results["missing_skills"]
    )
    db.add(match_record)
    db.commit()
    db.refresh(match_record)
    
    return match_record
