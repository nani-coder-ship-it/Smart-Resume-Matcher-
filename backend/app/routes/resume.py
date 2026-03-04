import os
import shutil
from typing import Any, List
from fastapi import APIRouter, Depends, UploadFile, File, BackgroundTasks, HTTPException
from sqlalchemy.orm import Session

from app.api import deps
from app.models.user import User
from app.models.resume import Resume
from app.services.pdf_parser import extract_text
from app.ai_engine.parser import parse_resume
from app.database.session import SessionLocal
from app.schemas.resume import Resume as ResumeSchema

router = APIRouter()

UPLOAD_DIR = "uploads/resumes"

def parse_and_score_resume(resume_id: int):
    """
    Background worker for parsing raw text and extracting NLP skills.
    In a real system, this might be handled by Celery for better retry 
    handling, but BackgroundTasks are sufficient for synchronous deployments.
    """
    db = SessionLocal()
    resume_record = None
    try:
        resume_record = db.query(Resume).filter(Resume.id == resume_id).first()
        if not resume_record:
            print(f"Resume ID {resume_id} not found")
            return
        
        print(f"Processing resume {resume_id}: {resume_record.filename}")
        
        # Update status to processing
        resume_record.status = "processing"
        db.commit()
        
        # 1. Extract raw text from physical file
        print(f"Extracting text from {resume_record.file_path}")
        raw_text = extract_text(resume_record.file_path)
        print(f"Extracted {len(raw_text)} characters")
        
        if not raw_text or len(raw_text.strip()) == 0:
            raise ValueError("Failed to extract text from resume file")
        
        # 2. Extract structured fields via NLP
        print("Parsing resume with NLP")
        parsed_json = parse_resume(raw_text)
        print(f"Parsed resume: {parsed_json}")
        
        # 3. Calculate ATS Score
        print("Calculating ATS score")
        from app.ai_engine.ats_scorer import calculate_ats_score
        score_results = calculate_ats_score(parsed_json)
        print(f"ATS Score: {score_results['ats_score']}")
        
        # 4. Save state
        resume_record.parsed_data = parsed_json
        resume_record.ats_score = score_results["ats_score"]
        resume_record.status = "completed"
        db.commit()
        print(f"Resume {resume_id} processing completed successfully")
    except Exception as e:
        print(f"Error processing resume {resume_id}: {str(e)}")
        import traceback
        traceback.print_exc()
        db.rollback()
        if resume_record:
            resume_record.status = "failed"
            resume_record.parsed_data = {"error": str(e)}
            db.commit()
    finally:
        db.close()

@router.get("/", response_model=List[ResumeSchema])
def get_user_resumes(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
    """
    Retrieve all uploaded resumes for the current user.
    """
    resumes = db.query(Resume).filter(Resume.user_id == current_user.id).order_by(Resume.created_at.desc()).all()
    return resumes

@router.post("/upload")
async def upload_resume(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
    """
    Upload a resume file and trigger background processing.
    """
    if not file.filename.endswith((".pdf", ".docx")):
        raise HTTPException(status_code=400, detail="Only PDF and DOCX files are supported")
    
    # Ensure upload directory exists
    os.makedirs(UPLOAD_DIR, exist_ok=True)
    
    # Save file
    file_path = os.path.join(UPLOAD_DIR, f"{current_user.id}_{file.filename}")
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    # Create DB record
    resume_record = Resume(
        user_id=current_user.id,
        filename=file.filename,
        file_path=file_path,
        status="pending"
    )
    db.add(resume_record)
    db.commit()
    db.refresh(resume_record)
    
    # Dispatch Background Task for processing
    background_tasks.add_task(parse_and_score_resume, resume_record.id)
    
    return {"message": "Resume uploaded successfully", "resume_id": resume_record.id, "status": "pending"}

@router.get("/{resume_id}", response_model=ResumeSchema)
def get_resume_details(
    resume_id: int,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
    """
    Get detailed information about a specific resume including parsed data and ATS score.
    """
    resume = db.query(Resume).filter(
        Resume.id == resume_id,
        Resume.user_id == current_user.id
    ).first()
    
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    
    return resume
