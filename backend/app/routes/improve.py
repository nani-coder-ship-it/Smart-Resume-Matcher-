from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from app.database.session import SessionLocal
from app.ai_engine.resume_enhancer import optimize_resume
from pydantic import BaseModel
from typing import Optional, List
from io import BytesIO
import base64

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
    optimized_resume_pdf: str
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
    Analyze resume against job description and generate optimized version with PDF
    """
    from app.models.resume import Resume
    
    # Fetch resume
    resume = db.query(Resume).filter(Resume.id == request.resume_id).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    
    if not resume.parsed_data:
        raise HTTPException(status_code=400, detail="Resume has not been processed yet")
    
    # Optimize resume with file path for PDF processing
    result = optimize_resume(
        resume.parsed_data, 
        request.job_description,
        file_path=resume.file_path  # Pass the original PDF file path
    )
    
    return ImprovedResumeResponse(
        ats_score=result["ats_score"],
        matching_skills=result["matching_skills"],
        missing_skills=result["missing_skills"],
        suggestions=result["suggestions"],
        optimized_resume=result["optimized_resume"],
        optimized_resume_pdf=result["optimized_resume_pdf"],
        comparison=result["comparison"]
    )

@router.post("/download-pdf")
async def download_optimized_pdf(request: ResumeImproveRequest, db: Session = Depends(get_db)):
    """
    Download optimized resume as PDF file
    """
    from app.models.resume import Resume
    
    # Fetch resume
    resume = db.query(Resume).filter(Resume.id == request.resume_id).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    
    if not resume.parsed_data:
        raise HTTPException(status_code=400, detail="Resume has not been processed yet")
    
    # Get optimized version
    result = optimize_resume(resume.parsed_data, request.job_description)
    
    # Decode base64 PDF
    pdf_data = base64.b64decode(result["optimized_resume_pdf"])
    
    # Return as file response
    return FileResponse(
        BytesIO(pdf_data),
        media_type="application/pdf",
        filename=f"optimized-resume-{resume.id}.pdf"
    )
