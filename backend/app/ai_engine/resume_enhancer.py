import re
from typing import Dict, List, Any, Tuple, Optional
from collections import Counter
from io import BytesIO
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak
from reportlab.lib.enums import TA_LEFT, TA_CENTER

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
    "Machine Learning": ["NLP", "Computer Vision", "Deep Learning", "Neural Networks"],
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
        "raw_text": parsed_data.get("raw_text", ""),
    }

def extract_job_requirements(job_description: str) -> Dict[str, Any]:
    """Extract requirements from job description"""
    job_lower = job_description.lower()
    
    # Extract technical terms
    tech_keywords = []
    for skill_family, variants in TECHNICAL_SKILLS_DB.items():
        if skill_family.lower() in job_lower:
            tech_keywords.append(skill_family)
        for variant in variants:
            if variant.lower() in job_lower:
                tech_keywords.append(variant)
    
    # Remove duplicates while preserving order
    tech_keywords = list(dict.fromkeys(tech_keywords))
    
    # Extract experience level
    years_pattern = r'(\d+)\+?\s*(?:years?|yrs)'
    years_matches = re.findall(years_pattern, job_description, re.IGNORECASE)
    min_years = min(int(y) for y in years_matches) if years_matches else 0
    
    return {
        "tech_keywords": tech_keywords,
        "years_experience": min_years,
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
        ats_score = int(50 + (match_percentage * 50))
    
    return {
        "ats_score": min(100, ats_score),
        "matching_count": len(matching_skills),
        "missing_count": len(missing_skills),
        "matching_skills": matching_skills,
        "missing_skills": missing_skills[:10],
        "keyword_density": (len(matching_skills) / len(job_skills) * 100) if job_skills else 0
    }

def enhance_resume_text(resume_text: str, missing_skills: List[str], job_keywords: List[str]) -> str:
    """
    Enhance the actual resume text by:
    1. Adding missing skills naturally to the skills section
    2. Improving bullet points with action verbs
    3. Inserting relevant keywords naturally
    """
    
    enhanced_text = resume_text
    
    # Add missing skills to skills section if it exists
    if missing_skills:
        skills_section_pattern = r'(#+\s*(?:Skills?|Technical Skills|Competencies).*?)(?=#+|$)'
        match = re.search(skills_section_pattern, enhanced_text, re.IGNORECASE | re.DOTALL)
        
        if match:
            section_start = match.start()
            section_end = match.end()
            skills_section = match.group(1)
            
            # Add missing skills naturally
            missing_skills_str = ", ".join(missing_skills[:5])
            enhanced_section = skills_section.rstrip() + f"\n- {missing_skills_str}"
            enhanced_text = enhanced_text[:section_start] + enhanced_section + enhanced_text[section_end:]
    
    # Enhance bullet points with stronger action verbs
    bullet_pattern = r'([•\-\*]\s*)([a-z])(.*?)(?=[•\-\*]|$|\n)'
    
    def upgrade_bullet(match):
        prefix = match.group(1)
        first_letter = match.group(2).upper()
        rest = match.group(3)
        
        # Check if it already starts with an action verb
        words = rest.split()
        if words and not any(verb.lower() in words[0].lower() for verb in ACTION_VERBS):
            # Pick a random action verb based on context
            action_verb = ACTION_VERBS[hash(rest) % len(ACTION_VERBS)]
            return f"{prefix}{action_verb} {first_letter}{rest}"
        
        return match.group(0)
    
    enhanced_text = re.sub(bullet_pattern, upgrade_bullet, enhanced_text, flags=re.IGNORECASE)
    
    return enhanced_text

def generate_improvement_suggestions(comparison: Dict[str, Any]) -> List[str]:
    """Generate AI-powered suggestions"""
    suggestions = []
    
    if comparison["missing_skills"]:
        missing = ", ".join(comparison["missing_skills"][:5])
        suggestions.append(f"✓ Add missing skills: {missing}")
    
    if comparison["keyword_density"] < 70:
        suggestions.append("✓ Incorporate more job-related keywords throughout resume")
    
    suggestions.append("✓ Use strong action verbs: Developed, Implemented, Optimized, Designed, Architected")
    suggestions.append("✓ Quantify achievements: Added percentages, metrics, and impact numbers")
    suggestions.append("✓ Align experience with job responsibilities and requirements")
    suggestions.append("✓ Highlight relevant technologies and projects prominently")
    
    return suggestions

def generate_pdf_from_text(text: str, title: str = "Optimized Resume") -> BytesIO:
    """Generate PDF from plain text resume"""
    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter, topMargin=0.5*inch, bottomMargin=0.5*inch)
    
    styles = getSampleStyleSheet()
    story = []
    
    # Add title
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=16,
        textColor='#1e3a8a',
        spaceAfter=12,
        alignment=TA_CENTER
    )
    
    # Split text into lines and process
    lines = text.split('\n')
    for line in lines:
        line = line.strip()
        if not line:
            story.append(Spacer(1, 0.1*inch))
        elif line.startswith('#'):
            # Header
            level = len(re.match(r'^#+', line).group(0))
            content = line.lstrip('#').strip()
            if level == 1:
                story.append(Paragraph(content, title_style))
            else:
                style = styles['Heading2'] if level == 2 else styles['Heading3']
                story.append(Paragraph(content, style))
            story.append(Spacer(1, 0.08*inch))
        else:
            # Regular text
            story.append(Paragraph(line, styles['Normal']))
    
    doc.build(story)
    buffer.seek(0)
    return buffer

def optimize_resume(parsed_resume_data: Dict[str, Any], job_description: str, file_path: Optional[str] = None) -> Dict[str, Any]:
    """
    Main function to optimize resume with REAL editing, not template generation.
    Returns ONLY enhanced resume text in PDF format.
    """
    from app.ai_engine.real_resume_enhancer import enhance_resume, extract_job_skills
    from app.ai_engine.pdf_enhancer import create_pdf_from_text
    import base64
    
    # Extract data
    resume_data = extract_resume_data(parsed_resume_data)
    job_info = extract_job_requirements(job_description)
    
    # Compare for analytics
    comparison = compare_resume_to_job(resume_data.get("skills", []), job_info)
    
    # Get the original resume text
    original_text = resume_data.get("raw_text", "")
    
    if not original_text or not original_text.strip():
        # Fallback: generate from extracted data if no raw text
        enhanced_text = generate_resume_from_extracted_data(resume_data, comparison["missing_skills"])
    else:
        # REAL ENHANCEMENT: Edit the actual resume
        job_skills = extract_job_skills(job_description)
        enhanced_text = enhance_resume(
            original_text,
            comparison["missing_skills"],
            job_skills
        )
    
    # Generate suggestions for display only (not in PDF)
    suggestions = generate_improvement_suggestions(comparison)
    
    # Generate PDF from ONLY the enhanced resume (NO analysis section)
    try:
        pdf_buffer = create_pdf_from_text(enhanced_text)  # Just the resume, no analysis
        pdf_base64 = base64.b64encode(pdf_buffer.getvalue()).decode('utf-8')
    except Exception as e:
        print(f"PDF generation error: {e}")
        pdf_base64 = ""
    
    return {
        "ats_score": comparison["ats_score"],
        "matching_skills": comparison["matching_skills"],
        "missing_skills": comparison["missing_skills"],
        "suggestions": suggestions,
        "original_resume": original_text,  # Return original for user to edit
        "optimized_resume": enhanced_text,  # Show AI suggestions
        "optimized_resume_pdf": pdf_base64,  # PDF of enhanced resume
        "comparison": {
            "keyword_density": comparison["keyword_density"],
            "matching_count": comparison["matching_count"],
            "missing_count": comparison["missing_count"]
        }
    }

def generate_resume_from_extracted_data(resume_data: Dict[str, Any], missing_skills: List[str]) -> str:
    """Generate a resume from extracted structured data"""
    
    name = resume_data.get("name", "Professional")
    email = resume_data.get("email", "")
    phone = resume_data.get("phone", "")
    linkedin = resume_data.get("linkedin", "")
    github = resume_data.get("github", "")
    skills = resume_data.get("skills", [])
    
    # Combine all skills including missing ones
    all_skills = list(set(skills + missing_skills))
    
    resume_content = f"""# {name}

## Contact Information
Email: {email}
Phone: {phone}
LinkedIn: {linkedin}
GitHub: {github}

## Professional Summary
Dedicated professional with strong technical expertise and a proven track record of delivering impactful solutions. Skilled in problem-solving, collaboration, and leveraging latest technologies to drive business success.

## Technical Skills
{', '.join(all_skills[:15]) if all_skills else 'Technical skills not available'}

## Core Competencies
- Software Development
- Technical Problem Solving
- Team Collaboration
- Project Management
- Quality Assurance

## Experience
[Your professional experience details with quantifiable achievements and measurable impact]

## Education
[Your educational background and certifications]

## Additional Information
- Languages: [List any languages]
- Certifications: [Professional certifications if any]

---
*Resume enhanced with AI Resume Improvement Tool - {', '.join(missing_skills[:3]) if missing_skills else 'optimization complete'}*
"""
    return resume_content

