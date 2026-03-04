from typing import Any, Dict
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.api import deps
from app.models.user import User
from app.models.resume import Resume
from app.models.match import MatchResult

router = APIRouter()

@router.get("/summary", response_model=Dict[str, Any])
def get_dashboard_summary(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
    """
    Retrieve aggregated dashboard statistics for the logged-in user.
    """
    # 1. Total resumes uploaded
    total_resumes = db.query(Resume).filter(Resume.user_id == current_user.id).count()
    
    # 2. Latest ATS Score
    latest_resume = db.query(Resume).filter(Resume.user_id == current_user.id).order_by(Resume.created_at.desc()).first()
    latest_ats_score = latest_resume.ats_score if latest_resume and latest_resume.ats_score is not None else 0.0
    
    # 3. Average Match Score across all matches for this user's resumes
    avg_match_query = db.query(func.avg(MatchResult.match_percentage)) \
                        .join(Resume) \
                        .filter(Resume.user_id == current_user.id).scalar()
    
    avg_match_score = round(avg_match_query, 2) if avg_match_query is not None else 0.0
    
    # 4. Total Jobs Analyzed
    total_matches = db.query(MatchResult) \
                      .join(Resume) \
                      .filter(Resume.user_id == current_user.id).count()
                      
    return {
        "total_resumes_uploaded": total_resumes,
        "latest_ats_score": round(latest_ats_score, 1),
        "average_match_score": avg_match_score,
        "total_job_matches_run": total_matches
    }
