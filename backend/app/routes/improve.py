from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from app.database.session import SessionLocal
from app.ai_engine.resume_enhancer import optimize_resume
from app.ai_engine.edit_suggestion_engine import generate_edit_suggestions
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from io import BytesIO
import base64
import time

router = APIRouter(prefix="/api/v1/resume-improve", tags=["resume-improvement"])

class GeneratePDFRequest(BaseModel):
    resume_text: str
    resume_id: Optional[int] = None  # Reference to original resume file

class ResumeImproveRequest(BaseModel):
    resume_id: int
    job_description: str
    job_title: Optional[str] = None

class EditSuggestion(BaseModel):
    section: str
    action: str
    original_text: str
    suggested_text: str
    reason: str

class EditSuggestionsResponse(BaseModel):
    matching_skills: List[str]
    missing_skills: List[str]
    edit_suggestions: List[EditSuggestion]

class ImprovedResumeResponse(BaseModel):
    ats_score: int
    matching_skills: List[str]
    missing_skills: List[str]
    suggestions: List[str]
    original_resume: str
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
        original_resume=result["original_resume"],
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

@router.post("/generate-edited-pdf")
async def generate_edited_pdf(request: GeneratePDFRequest, db: Session = Depends(get_db)):
    """
    Generate PDF from edited resume text using the original resume's file
    Takes the existing PDF, applies edits, returns updated version
    """
    from app.ai_engine.pdf_enhancer import create_pdf_from_text
    from app.models.resume import Resume
    
    resume_text = request.resume_text.strip()
    if not resume_text:
        raise HTTPException(status_code=400, detail="Resume text is empty")
    
    try:
        # Generate professional PDF from the edited resume text
        pdf_buffer = create_pdf_from_text(resume_text)
        pdf_bytes = pdf_buffer.getvalue()
        
        # Return as streaming response with proper PDF headers
        return StreamingResponse(
            BytesIO(pdf_bytes),
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename=edited-resume-{int(time.time())}.pdf"}
        )
    except Exception as e:
        print(f"PDF generation error: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate PDF")

@router.post("/get-edit-suggestions", response_model=EditSuggestionsResponse)
async def get_edit_suggestions(request: ResumeImproveRequest, db: Session = Depends(get_db)):
    """
    Get structured editing suggestions for resume improvement
    Provides specific edits user can apply to their resume
    """
    from app.models.resume import Resume
    
    # Fetch resume
    resume = db.query(Resume).filter(Resume.id == request.resume_id).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    
    if not resume.parsed_data:
        raise HTTPException(status_code=400, detail="Resume has not been processed yet")
    
    # Generate structured edit suggestions
    suggestions = generate_edit_suggestions(
        resume_text=resume.parsed_data,
        job_description=request.job_description
    )
    
    return EditSuggestionsResponse(
        matching_skills=suggestions["matching_skills"],
        missing_skills=suggestions["missing_skills"],
        edit_suggestions=[EditSuggestion(**s) for s in suggestions["edit_suggestions"]]
    )


