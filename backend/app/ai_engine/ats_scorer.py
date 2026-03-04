from typing import Dict, Any, List

def calculate_ats_score(parsed_resume_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Evaluates a resume based on basic heuristic rules to generate an ATS compatibility score.
    Returns the score out of 100, and a list of improvements.
    """
    score = 100
    improvements = []
    
    # 1. Contact Information Check
    if not parsed_resume_data.get("email"):
        score -= 10
        improvements.append("Missing email address. ATS parsers typically look for standard contact info.")
        
    if not parsed_resume_data.get("phone"):
        score -= 5
        improvements.append("Missing phone number.")
        
    # 2. Skill Density Check
    skills = parsed_resume_data.get("skills", [])
    if len(skills) < 5:
        score -= 20
        improvements.append("Low skill density. Try adding more relevant technical and soft skills (at least 5-10).")
    elif len(skills) > 30:
        score -= 5
        improvements.append("Very high skill density. Ensure you only list skills you are proficient in to avoid keyword stuffing penalties.")

    # 3. Text Length / Detail Check
    raw_length = parsed_resume_data.get("raw_text_length", 0)
    if raw_length < 1000:
        score -= 15
        improvements.append("Resume seems too short. Ensure you have detailed descriptions of your work experience.")
    elif raw_length > 5000:
        score -= 5
        improvements.append("Resume seems very long. Consider keeping it concise, ideally 1-2 pages.")
        
    return {
        "ats_score": max(0, score), # Ensure score doesn't go below 0
        "improvements": improvements
    }
