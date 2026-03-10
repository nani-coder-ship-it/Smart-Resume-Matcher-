"""
Resume Editing Suggestion Engine
Generates structured editing suggestions for resume improvement
"""

import re
from typing import List, Dict, Any

def extract_job_requirements(job_description: str) -> Dict[str, List[str]]:
    """Extract skills, technologies, and keywords from job description"""
    
    # Convert to lowercase for matching
    job_lower = job_description.lower()
    
    # Common skills and tech patterns
    skills_patterns = {
        # Programming Languages
        "Python": r"\bpython\b",
        "Java": r"\bjava\b",
        "JavaScript": r"\b(javascript|js)\b",
        "TypeScript": r"\b(typescript|ts)\b",
        "C++": r"\bc\+\+\b",
        "C#": r"\bc#\b",
        "Go": r"\bgo\b",
        "Rust": r"\brust\b",
        "PHP": r"\bphp\b",
        "Ruby": r"\bruby\b",
        
        # Frontend Frameworks
        "React": r"\breact\b",
        "Vue": r"\b(vue|vue\.js)\b",
        "Angular": r"\bangular\b",
        "Next.js": r"\b(next\.js|nextjs)\b",
        "Svelte": r"\bsvelte\b",
        "Ember": r"\bember\b",
        
        # Backend Frameworks
        "Django": r"\bdjango\b",
        "Flask": r"\bflask\b",
        "FastAPI": r"\bfastapi\b",
        "Express": r"\bexpress\b",
        "Spring": r"\b(spring|spring boot)\b",
        "Laravel": r"\blaravel\b",
        "Rails": r"\brails\b",
        
        # Databases
        "PostgreSQL": r"\b(postgresql|postgres)\b",
        "MySQL": r"\bmysql\b",
        "MongoDB": r"\bmongodb\b",
        "Redis": r"\bredis\b",
        "DynamoDB": r"\bdynamodb\b",
        "Elasticsearch": r"\belasticsearch\b",
        "Firebase": r"\bfirebase\b",
        "SQL Server": r"\bsql server\b",
        
        # Cloud & DevOps
        "AWS": r"\b(aws|amazon web services)\b",
        "Azure": r"\bazure\b",
        "GCP": r"\b(gcp|google cloud)\b",
        "Docker": r"\bdocker\b",
        "Kubernetes": r"\b(kubernetes|k8s)\b",
        "Terraform": r"\bterraform\b",
        "Jenkins": r"\bjenkins\b",
        "GitLab CI": r"\b(gitlab ci|gitlab-ci)\b",
        "GitHub Actions": r"\bgithub actions\b",
        
        # AI/ML
        "TensorFlow": r"\btensorflow\b",
        "PyTorch": r"\b(pytorch|torch)\b",
        "Machine Learning": r"\bmachine learning\b",
        "Deep Learning": r"\bdeep learning\b",
        "NLP": r"\b(nlp|natural language processing)\b",
        "Computer Vision": r"\bcomputer vision\b",
        "Scikit-learn": r"\b(scikit-learn|sklearn)\b",
        "Pandas": r"\bpandas\b",
        "NumPy": r"\b(numpy|np)\b",
        
        # Others
        "RESTful API": r"\b(restful api|rest api)\b",
        "GraphQL": r"\bgraphql\b",
        "Git": r"\bgit\b",
        "CI/CD": r"\b(ci/cd|ci cd)\b",
        "Agile": r"\bagile\b",
        "Scrum": r"\bscrum\b",
        "Linux": r"\blinux\b",
        "Windows": r"\bwindows\b",
        "macOS": r"\bmacos\b",
        "AWS S3": r"\b(s3|aws s3|amazon s3)\b",
        "API Development": r"\bapi development\b",
        "Microservices": r"\bmicroservices\b",
        "SOA": r"\b(soa|service-oriented architecture)\b",
    }
    
    required_skills = []
    for skill, pattern in skills_patterns.items():
        if re.search(pattern, job_lower):
            required_skills.append(skill)
    
    # Extract keywords (longer phrases)
    keywords = []
    keyword_phrases = [
        r"full-?stack",
        r"end-to-end",
        r"problem solving",
        r"communication",
        r"teamwork",
        r"collaboration",
        r"leadership",
        r"analytical",
    ]
    
    for phrase_pattern in keyword_phrases:
        if re.search(phrase_pattern, job_lower):
            keywords.append(phrase_pattern.replace(r"\.?\-?", "").replace("?", ""))
    
    return {
        "skills": list(set(required_skills)),
        "keywords": list(set(keywords))
    }


def extract_resume_skills(resume_text: str) -> List[str]:
    """Extract skills from resume text"""
    
    resume_lower = resume_text.lower()
    
    # Common skills to look for
    skills_list = [
        "Python", "Java", "JavaScript", "TypeScript", "C++", "C#", "Go", "Rust", "PHP", "Ruby",
        "React", "Vue", "Angular", "Next.js", "Svelte", "Ember",
        "Django", "Flask", "FastAPI", "Express", "Spring", "Laravel", "Rails",
        "PostgreSQL", "MySQL", "MongoDB", "Redis", "DynamoDB", "Elasticsearch", "Firebase",
        "AWS", "Azure", "GCP", "Docker", "Kubernetes", "Terraform", "Jenkins",
        "TensorFlow", "PyTorch", "Machine Learning", "Deep Learning", "NLP",
        "RESTful API", "GraphQL", "Git", "CI/CD", "Agile", "Scrum", "Linux",
    ]
    
    found_skills = []
    for skill in skills_list:
        pattern = re.escape(skill).replace(r"\ ", r"\b.*?\b").lower()
        # More flexible matching
        if re.search(r"\b" + re.escape(skill.lower()) + r"\b", resume_lower):
            found_skills.append(skill)
    
    return list(set(found_skills))


def analyze_bullet_points(resume_text: str, job_description: str) -> List[Dict[str, str]]:
    """Analyze bullet points for weakness and suggest improvements"""
    
    weak_verbs = {
        "did": "Executed",
        "made": "Built",
        "helped": "Contributed",
        "worked on": "Developed",
        "participated in": "Spearheaded",
        "involved in": "Directed",
        "used": "Leveraged",
        "tried": "Implemented",
        "was responsible for": "Managed",
        "handled": "Orchestrated",
    }
    
    suggestions = []
    
    # Find bullet points (lines starting with - or •)
    bullet_pattern = r"(?:^|\n)\s*[-•]\s*(.+?)(?=\n|$)"
    bullets = re.findall(bullet_pattern, resume_text, re.MULTILINE)
    
    for bullet in bullets:
        suggestion = None
        
        # Check for weak verbs
        for weak, strong in weak_verbs.items():
            if weak.lower() in bullet.lower():
                improved = re.sub(
                    r"\b" + re.escape(weak) + r"\b",
                    strong,
                    bullet,
                    flags=re.IGNORECASE
                )
                suggestion = {
                    "original": bullet.strip(),
                    "suggested": improved.strip(),
                    "reason": f"Replace weak verb '{weak}' with stronger action verb '{strong}'"
                }
                break
        
        # Check for missing quantifiable metrics
        if suggestion is None and not re.search(r"\d+%|\d+x|increased|improved by", bullet, re.IGNORECASE):
            suggestion = {
                "original": bullet.strip(),
                "suggested": bullet.strip() + " (consider adding metrics/results)",
                "reason": "Add quantifiable results or metrics to strengthen impact"
            }
        
        if suggestion:
            suggestions.append(suggestion)
    
    return suggestions


def generate_edit_suggestions(resume_text: str, job_description: str) -> Dict[str, Any]:
    """
    Generate structured editing suggestions for resume improvement
    
    Returns JSON with:
    - matching_skills: Skills already in resume
    - missing_skills: Skills from job posting not in resume
    - edit_suggestions: Specific edits with original/suggested text
    """
    
    # Extract requirements from job description
    job_reqs = extract_job_requirements(job_description)
    required_skills = job_reqs["skills"]
    
    # Extract skills from resume
    resume_skills = extract_resume_skills(resume_text)
    
    # Find matching and missing skills
    matching_skills = [s for s in required_skills if s in resume_skills]
    missing_skills = [s for s in required_skills if s not in resume_skills]
    
    # Analyze bullet points
    bullet_suggestions = analyze_bullet_points(resume_text, job_description)
    
    # Build edit suggestions
    edit_suggestions = []
    
    # 1. Add missing skills to Skills section
    if missing_skills:
        # Find Skills section
        skills_pattern = r"^(SKILLS|TECHNICAL SKILLS|COMPETENCIES|TECHNOLOGIES).*?(?=^[A-Z]|\Z)"
        skills_match = re.search(skills_pattern, resume_text, re.MULTILINE | re.IGNORECASE | re.DOTALL)
        
        if skills_match:
            skills_section = skills_match.group(0)
            # Extract the skills list (usually comma-separated or bullet points)
            skills_content = re.sub(r"^(SKILLS|TECHNICAL SKILLS|COMPETENCIES|TECHNOLOGIES)\s*\n?", "", skills_section, flags=re.IGNORECASE).strip()
            
            suggested_skills = skills_content + ", " + ", ".join(missing_skills)
            
            edit_suggestions.append({
                "section": "Skills",
                "action": "Add",
                "original_text": skills_content,
                "suggested_text": suggested_skills,
                "reason": f"Add missing skills required for the job: {', '.join(missing_skills)}"
            })
    
    # 2. Add bullet point improvements
    for bullet_sugg in bullet_suggestions[:5]:  # Limit to 5 suggestions
        edit_suggestions.append({
            "section": "Experience",
            "action": "Improve",
            "original_text": bullet_sugg["original"],
            "suggested_text": bullet_sugg["suggested"],
            "reason": bullet_sugg["reason"]
        })
    
    # 3. Suggest adding job keywords if missing
    job_keywords_to_check = ["full-stack", "end-to-end", "problem solving", "leadership"]
    for keyword in job_keywords_to_check:
        if keyword.lower() in job_description.lower() and keyword.lower() not in resume_text.lower():
            edit_suggestions.append({
                "section": "Summary",
                "action": "Add",
                "original_text": "[Summary section]",
                "suggested_text": f"[Add '{keyword}' naturally into your summary or experience descriptions]",
                "reason": f"The job posting emphasizes '{keyword}' - include this in your summary"
            })
    
    return {
        "matching_skills": list(set(matching_skills)),
        "missing_skills": list(set(missing_skills)),
        "edit_suggestions": edit_suggestions[:10]  # Max 10 suggestions
    }
