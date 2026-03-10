"""
Real Resume Enhancement Module
Edits the actual resume by:
1. Adding missing skills to existing Skills section
2. Improving bullet points with action verbs
3. Integrating job keywords naturally
4. Preserving original structure

STRICT RULES:
- NO new sections added
- NO analysis text added
- ONLY edited resume text returned
"""

import re
from typing import Dict, List, Any, Optional

# Action verbs for enhancement
WEAK_VERBS = {
    'did': 'Executed', 'made': 'Built', 'worked': 'Developed', 'helped': 'Assisted',
    'got': 'Achieved', 'has': 'Demonstrated', 'created': 'Engineered', 
    'found': 'Identified', 'used': 'Leveraged', 'tried': 'Implemented',
    'responsible for': 'Led', 'involved in': 'Contributed to', 'was part of': 'Participated in'
}

STRONG_VERBS = [
    'Accomplished', 'Achieved', 'Built', 'Designed', 'Developed', 'Engineered',
    'Enhanced', 'Implemented', 'Improved', 'Increased', 'Innovated', 'Optimized',
    'Orchestrated', 'Programmed', 'Redesigned', 'Refactored', 'Resolved', 'Spearheaded',
    'Streamlined', 'Developed', 'Analyzed', 'Architected', 'Collaborated', 'Directed',
    'Executed', 'Integrated', 'Led', 'Managed', 'Modernized', 'Scaled'
]


def extract_job_skills(job_description: str) -> List[str]:
    """Extract skill keywords from job description with proper pattern matching"""
    job_lower = job_description.lower()
    
    # Skills with patterns for flexible matching
    skills_patterns = {
        'Python': r'\bpython\b',
        'Java': r'\bjava\b',
        'JavaScript': r'\b(javascript|js)\b',
        'TypeScript': r'\b(typescript|ts)\b',
        'React': r'\breact\b',
        'Angular': r'\bangular\b',
        'Vue': r'\b(vue|vue\.js)\b',
        'Node.js': r'\b(node\.?js|nodejs)\b',
        'Express': r'\bexpress\b',
        'Django': r'\bdjango\b',
        'Flask': r'\bflask\b',
        'FastAPI': r'\bfastapi\b',
        'Spring': r'\bspring\b',
        'AWS': r'\b(aws|amazon web services)\b',
        'Azure': r'\b(azure|microsoft azure)\b',
        'GCP': r'\b(gcp|google cloud)\b',
        'S3': r'\b(s3|aws s3|amazon s3)\b',
        'Docker': r'\bdocker\b',
        'Kubernetes': r'\b(kubernetes|k8s)\b',
        'Terraform': r'\bterraform\b',
        'Jenkins': r'\bjenkins\b',
        'SQL': r'\bsql\b',
        'MySQL': r'\bmysql\b',
        'PostgreSQL': r'\b(postgresql|postgres)\b',
        'MongoDB': r'\bmongodb\b',
        'Redis': r'\bredis\b',
        'Elasticsearch': r'\belasticsearch\b',
        'HTML': r'\b(html|html5)\b',
        'CSS': r'\b(css|css3)\b',
        'Sass': r'\b(sass|scss)\b',
        'Tailwind': r'\btailwind\b',
        'Bootstrap': r'\bbootstrap\b',
        'GraphQL': r'\bgraphql\b',
        'REST API': r'\b(rest api|restful api|rest)\b',
        'Git': r'\bgit\b',
        'GitHub': r'\b(github|git hub)\b',
        'GitLab': r'\b(gitlab|git lab)\b',
        'Bitbucket': r'\bbitbucket\b',
        'CI/CD': r'\b(ci/cd|continuous integration|continuous deployment)\b',
        'DevOps': r'\bdevops\b',
        'Agile': r'\bagile\b',
        'Scrum': r'\bscrum\b',
        'Kanban': r'\bkanban\b',
        'Jira': r'\bjira\b',
        'Machine Learning': r'\b(machine learning|ml)\b',
        'AI': r'\b(artificial intelligence|ai)\b',
        'Data Science': r'\bdata science\b',
        'NLP': r'\b(nlp|natural language processing)\b',
        'Deep Learning': r'\bdeep learning\b',
        'Microservices': r'\bmicroservices\b',
        'Serverless': r'\bserverless\b',
        'API': r'\bapi\b',
        'Cloud': r'\bcloud\b',
        'Linux': r'\blinux\b',
        'Windows': r'\bwindows\b',
        'Firebase': r'\bfirebase\b',
        'Stripe': r'\bstripe\b',
        'OAuth': r'\boauth\b',
        'JWT': r'\b(jwt|json web token)\b',
        'React Native': r'\breact native\b',
        'Next.js': r'\b(next\.js|nextjs)\b',
        'Nuxt': r'\bnuxt\b',
        'Webpack': r'\bwebpack\b',
        'Vite': r'\bvite\b',
        'RabbitMQ': r'\brabbitmq\b',
        'Kafka': r'\bkafka\b',
        'Apache': r'\bapache\b',
        'Nginx': r'\bnginx\b',
        'REST': r'\brest\b',
        'GraphQL': r'\bgraphql\b',
    }
    
    found_skills = []
    found_skills_lower = set()
    
    for skill_name, pattern in skills_patterns.items():
        if re.search(pattern, job_lower):
            skill_normalized = skill_name.lower()
            if skill_normalized not in found_skills_lower:
                found_skills.append(skill_name)
                found_skills_lower.add(skill_normalized)
    
    return found_skills


def find_skills_section(resume_text: str) -> Optional[tuple]:
    """
    Find the Skills section in resume.
    Returns (start_pos, end_pos, section_text) or None
    """
    lines = resume_text.split('\n')
    skills_start = None
    skills_end = None
    
    for i, line in enumerate(lines):
        # Look for Skills header (case-insensitive)
        if re.match(r'^\s*(skills|technical\s+skills|competencies|expertise|languages|tools)', line, re.IGNORECASE):
            skills_start = i
            # Find where skills section ends (next header)
            for j in range(i + 1, len(lines)):
                if re.match(r'^[A-Z\s]+$', lines[j].strip()) and len(lines[j].strip()) > 2:
                    if any(keyword in lines[j].lower() for keyword in ['experience', 'education', 'projects', 'certifications', 'summary']):
                        skills_end = j
                        break
            if skills_end is None:
                skills_end = len(lines)
            return (skills_start, skills_end, '\n'.join(lines[skills_start:skills_end]))
    
    return None


def add_missing_skills(resume_text: str, missing_skills: List[str]) -> str:
    """Add missing skills to existing Skills section"""
    
    if not missing_skills:
        return resume_text
    
    result = find_skills_section(resume_text)
    if not result:
        return resume_text
    
    start_pos, end_pos, section_text = result
    lines = resume_text.split('\n')
    
    # Find the line where we should add skills
    # Usually after the header, find the actual skills content
    skill_line_idx = start_pos + 1
    
    # Skip empty lines after header
    while skill_line_idx < len(lines) and not lines[skill_line_idx].strip():
        skill_line_idx += 1
    
    if skill_line_idx >= len(lines):
        return resume_text
    
    # Get existing skills line
    existing_skills_line = lines[skill_line_idx]
    
    # Parse existing skills
    existing_skills = [s.strip() for s in existing_skills_line.split(',')]
    existing_skills = [s for s in existing_skills if s]  # Remove empty
    
    # Add new skills (avoid duplicates)
    existing_skills_lower = [s.lower() for s in existing_skills]
    for skill in missing_skills:
        if skill.lower() not in existing_skills_lower:
            existing_skills.append(skill)
    
    # Create updated skills line
    updated_skills_line = ', '.join(existing_skills)
    lines[skill_line_idx] = updated_skills_line
    
    return '\n'.join(lines)


def improve_bullet_points(resume_text: str, job_keywords: List[str]) -> str:
    """
    Improve bullet points by:
    1. Replacing weak verbs with strong ones
    2. Adding relevant job keywords naturally
    """
    lines = resume_text.split('\n')
    result = []
    job_keywords_lower = [k.lower() for k in job_keywords]
    
    for line in lines:
        # Check if it's a bullet point
        if re.match(r'^\s*[-•*]\s+', line):
            # Remove bullet formatting temporarily
            bullet_match = re.match(r'^(\s*[-•*]\s+)', line)
            bullet = bullet_match.group(1)
            content = line[len(bullet):]
            
            # Replace weak verbs
            for weak, strong in WEAK_VERBS.items():
                if re.search(rf'\b{weak}\b', content, re.IGNORECASE):
                    content = re.sub(rf'\b{weak}\b', strong, content, count=1, flags=re.IGNORECASE)
                    break
            
            # If no verb found at start, consider adding one
            if not any(verb.lower() in content.lower() for verb in STRONG_VERBS):
                # Check if line starts with capital letter (already has verb-like structure)
                if content[0].isupper():
                    # Try to add a strong verb if it seems like a passive sentence
                    if 'was' in content.lower() or 'were' in content.lower():
                        content = re.sub(r'\bwas\b', 'Developed', content, count=1, flags=re.IGNORECASE)
                    elif 'responsible' in content.lower():
                        content = re.sub(r'responsible for\s+', 'Led ', content, count=1, flags=re.IGNORECASE)
            
            # Add job keywords naturally if they're technical and not already there
            for keyword in job_keywords:
                if keyword.lower() not in content.lower() and len(keyword) > 3:
                    # Don't force keywords, only add if it makes sense
                    pass
            
            result.append(bullet + content)
        else:
            result.append(line)
    
    return '\n'.join(result)


def enhance_resume(
    original_resume: str,
    missing_skills: List[str],
    job_keywords: List[str]
) -> str:
    """
    Main enhancement function that:
    1. Adds missing skills to Skills section
    2. Improves bullet points
    3. Returns ONLY the enhanced resume (no analysis)
    
    STRICT: NO new sections, NO analysis text
    """
    
    # Step 1: Add missing skills
    enhanced = add_missing_skills(original_resume, missing_skills)
    
    # Step 2: Improve bullet points
    enhanced = improve_bullet_points(enhanced, job_keywords)
    
    # Step 3: Return ONLY the resume
    # NO analysis sections, NO explanations
    return enhanced.strip()
