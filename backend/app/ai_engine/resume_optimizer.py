import re
from typing import Dict, List, Any, Tuple
from collections import Counter

# Action verbs database for resume improvement
ACTION_VERBS = [
    "Accomplished", "Achieved", "Analyzed", "Assessed", "Assisted", "Built", "Cleverly",
    "Collaborated", "Collected", "Completed", "Contributed", "Coordinated", "Created",
    "Debugged", "Delivered", "Demonstrated", "Designed", "Developed", "Directed",
    "Discovered", "Engineered", "Enhanced", "Established", "Evaluated", "Executed",
    "Expanded", "Facilitated", "Forecasted", "Formulated", "Generated", "Handled",
    "Implemented", "Improved", "Increased", "Innovated", "Integrated", "Investigated",
    "Led", "Managed", "Optimized", "Orchestrated", "Organized", "Initiated",
    "Pioneered", "Planned", "Processed", "Produced", "Programmed", "Promoted",
    "Proposed", "Proved", "Provided", "Published", "Recommended", "Redesigned",
    "Refactored", "Resolved", "Restructured", "Reviewed", "Revitalized", "Scaled",
    "Scheduled", "Secured", "Selected", "Simplified", "Solved", "Spearheaded",
    "Specified", "Streamlined", "Strengthened", "Structured", "Studied", "Submitted",
    "Succeeded", "Supervised", "Supported", "Synthesized", "Targeted", "Tested",
    "Tracked", "Trained", "Transformed", "Translated", "Trouble shot", "Underscored",
    "Unified", "Upgraded", "Utilized", "Validated", "Verified", "Vitalized"
]

# Technical skills database
TECHNICAL_SKILLS_DB = {
    "Java": ["OOP", "Spring Boot", "Spring MVC", "Hibernate", "Maven", "Gradle", "JUnit"],
    "Python": ["Django", "Flask", "FastAPI", "Pandas", "NumPy", "TensorFlow", "Scikit-learn"],
    "JavaScript": ["React", "Vue", "Angular", "Node.js", "Express", "TypeScript", "Webpack"],
    "SQL": ["MySQL", "PostgreSQL", "Oracle", "MongoDB", "Redis", "Cassandra"],
    "AWS": ["EC2", "S3", "Lambda", "RDS", "DynamoDB", "CloudFront"],
    "Azure": ["App Services", "Functions", "SQL Database", "Cosmos DB", "Storage"],
    "GCP": ["Compute Engine", "Cloud Functions", "Cloud SQL", "Firestore"],
    "Docker": ["Kubernetes", "Docker Compose", "Container Orchestration"],
    "CI/CD": ["Jenkins", "GitHub Actions", "GitLab CI", "CircleCI", "Travis CI"],
    "Machine Learning": ["NLP", "Computer Vision", "Deep Learning", "Neural Networks", "Data Science"],
    "Web Development": ["HTML", "CSS", "SASS", "Bootstrap", "Tailwind", "Responsive Design"],
    "DevOps": ["Terraform", "Ansible", "Prometheus", "Grafana", "ELK Stack"],
}

def extract_resume_data(parsed_data: Dict[str, Any]) -> Dict[str, Any]:
    """Extract all relevant resume data"""
    return {
        "name": parsed_data.get("name", ""),
        "email": parsed_data.get("email", ""),
        "phone": parsed_data.get("phone", ""),
        "linkedin": parsed_data.get("linkedin", ""),
        "github": parsed_data.get("github", ""),
        "skills": parsed_data.get("skills", []),
    }

def extract_job_requirements(job_description: str) -> Dict[str, Any]:
    """Extract requirements from job description"""
    job_lower = job_description.lower()
    
    # Extract required skills
    required_skills = []
    preferred_skills = []
    
    # Keywords that indicate required vs preferred
    required_keywords = ["required", "must have", "must possess", "essential"]
    preferred_keywords = ["preferred", "nice to have", "advantageous", "desired"]
    
    # Extract technical terms (simplified)
    tech_keywords = []
    for skill_family, variants in TECHNICAL_SKILLS_DB.items():
        if skill_family.lower() in job_lower:
            tech_keywords.append(skill_family)
        for variant in variants:
            if variant.lower() in job_lower:
                tech_keywords.append(variant)
    
    # Extract responsibilities
    responsibilities = []
    bullet_pattern = r'[•\-\*]\s*(.+?)(?=[•\-\*]|$|\n)'
    matches = re.findall(bullet_pattern, job_description, re.MULTILINE)
    responsibilities = [m.strip() for m in matches if len(m.strip()) > 10][:10]
    
    # Extract experience level
    years_pattern = r'(\d+)\+?\s*(?:years?|yrs)'
    years_matches = re.findall(years_pattern, job_description, re.IGNORECASE)
    min_years = min(int(y) for y in years_matches) if years_matches else 0
    
    return {
        "tech_keywords": tech_keywords,
        "responsibilities": responsibilities,
        "years_experience": min_years,
        "raw_text": job_description
    }

def compare_resume_to_job(resume_skills: List[str], job_info: Dict[str, Any]) -> Dict[str, Any]:
    """Compare resume with job requirements"""
    resume_skills_lower = [s.lower() for s in resume_skills]
    job_skills = [s.lower() for s in job_info.get("tech_keywords", [])]
    
    # Find matching skills
    matching_skills = list(set(resume_skills_lower) & set(job_skills))
    
    # Find missing skills
    missing_skills = list(set(job_skills) - set(resume_skills_lower))
    
    # Calculate ATS compatibility score
    if not job_skills:
        ats_score = 50
    else:
        match_percentage = len(matching_skills) / len(job_skills)
        ats_score = int(50 + (match_percentage * 50))  # 50-100 range
    
    # Calculate keyword density
    keyword_matches = sum(1 for skill in job_skills if any(skill in rs for rs in resume_skills_lower))
    
    return {
        "ats_score": min(100, ats_score),
        "matching_count": len(matching_skills),
        "missing_count": len(missing_skills),
        "matching_skills": matching_skills,
        "missing_skills": missing_skills[:10],  # Top 10 missing
        "keyword_density": (keyword_matches / len(job_skills) * 100) if job_skills else 0
    }

def generate_improvement_suggestions(resume_data: Dict[str, Any], job_info: Dict[str, Any], comparison: Dict[str, Any]) -> List[str]:
    """Generate AI-powered resume improvement suggestions"""
    suggestions = []
    
    # Missing skills suggestions
    if comparison["missing_skills"]:
        missing = ", ".join(comparison["missing_skills"][:5])
        suggestions.append(f"Add missing technical skills: {missing}")
    
    # Action verb enhancement
    suggestions.append("Use strong action verbs (e.g., 'Developed', 'Implemented', 'Optimized') in bullet points")
    
    # Keyword optimization
    if comparison["keyword_density"] < 70:
        suggestions.append("Increase keyword density by incorporating job description terms throughout resume")
    
    # Experience level
    suggestions.append(f"Highlight relevant projects and experience for the required {job_info.get('years_experience', 0)}+ years")
    
    # Responsibility alignment
    if job_info.get("responsibilities"):
        suggestions.append("Align your accomplishments with job responsibilities")
    
    # Skills section
    suggestions.append("Create a dedicated 'Skills' section with categorized technical competencies")
    
    return suggestions

def generate_optimized_resume(resume_data: Dict[str, Any], missing_skills: List[str]) -> str:
    """Generate optimized resume content"""
    optimized_resume = f"""# {resume_data.get('name', 'Candidate Name')}

## Contact Information
- Email: {resume_data.get('email', '')}
- Phone: {resume_data.get('phone', '')}
- LinkedIn: {resume_data.get('linkedin', '')}
- GitHub: {resume_data.get('github', '')}

## Professional Summary
Results-driven professional with demonstrated expertise in software development, problem-solving, and technical innovation. Proven track record of delivering high-impact solutions and collaborating effectively with cross-functional teams.

## Technical Skills
**Languages:** Java, Python, JavaScript, TypeScript, SQL
**Frameworks & Libraries:** React, Django, FastAPI, Spring Boot, Node.js
**Databases:** MySQL, PostgreSQL, MongoDB, Redis
**Cloud & DevOps:** AWS, Docker, Kubernetes, CI/CD
**Tools & Platforms:** Git, GitHub, GitLab, Jenkins, VS Code
**Additional:** {', '.join(resume_data.get('skills', [])[:10])}

## Experience
[Add your professional experience here with strong action verbs]

## Projects
[Highlight key projects demonstrating technical proficiency]

## Education
[Add your educational background here]

## Certifications & Recognition
[Add any relevant certifications]

---
*Resume Optimized with AI Resume Improvement Tool*
"""
    return optimized_resume

def optimize_resume(parsed_resume_data: Dict[str, Any], job_description: str) -> Dict[str, Any]:
    """Main function to optimize resume given job description"""
    
    # Extract data
    resume_data = extract_resume_data(parsed_resume_data)
    job_info = extract_job_requirements(job_description)
    
    # Compare
    comparison = compare_resume_to_job(resume_data.get("skills", []), job_info)
    
    # Generate suggestions
    suggestions = generate_improvement_suggestions(resume_data, job_info, comparison)
    
    # Generate optimized resume
    optimized_content = generate_optimized_resume(resume_data, comparison["missing_skills"])
    
    return {
        "ats_score": comparison["ats_score"],
        "matching_skills": comparison["matching_skills"],
        "missing_skills": comparison["missing_skills"],
        "suggestions": suggestions,
        "optimized_resume": optimized_content,
        "comparison": {
            "keyword_density": comparison["keyword_density"],
            "matching_count": comparison["matching_count"],
            "missing_count": comparison["missing_count"]
        }
    }
