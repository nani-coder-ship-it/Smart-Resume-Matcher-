from typing import List, Dict, Any
from app.ai_engine.parser import get_nlp

def analyze_job_description(job_text: str) -> List[str]:
    """
    Extracts key skills and requirements from a job description text.
    Reuses the skill extraction logic structure from the resume parser.
    """
    from app.ai_engine.parser import extract_skills
    return extract_skills(job_text)

def calculate_match(resume_skills: List[str], job_skills: List[str]) -> Dict[str, Any]:
    """
    Compares resume skills against the extracted job description skills.
    Returns the Match Percentage, missing skills, and matching skills.
    """
    resume_skills_set = set([s.lower() for s in resume_skills])
    job_skills_set = set([s.lower() for s in job_skills])

    if not job_skills_set:
        return {
            "match_percentage": 0.0,
            "matching_skills": [],
            "missing_skills": []
        }

    matching_skills = list(resume_skills_set.intersection(job_skills_set))
    missing_skills = list(job_skills_set.difference(resume_skills_set))

    # Basic Percentage Match
    match_percentage = (len(matching_skills) / len(job_skills_set)) * 100.0

    return {
        "match_percentage": round(match_percentage, 2),
        "matching_skills": sorted(matching_skills),
        "missing_skills": sorted(missing_skills)
    }
