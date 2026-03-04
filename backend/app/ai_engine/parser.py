import re
from typing import Dict, Any, List

# Try to load spaCy, but make it optional
nlp = None
SPACY_AVAILABLE = False

def get_nlp():
    global nlp, SPACY_AVAILABLE
    if nlp is None and SPACY_AVAILABLE is False:
        try:
            import spacy
            nlp = spacy.load("en_core_web_sm")
            SPACY_AVAILABLE = True
        except Exception as e:
            print(f"Warning: spaCy model not available: {e}")
            print("Using fallback text extraction method...")
            SPACY_AVAILABLE = False
    return nlp

# A very basic list of known tech skills for the initial heuristic matching
KNOWN_SKILLS = set([
    "python", "java", "javascript", "typescript", "c++", "c#", "ruby", "go", "rust",
    "react", "angular", "vue", "node.js", "nodejs", "django", "flask", "fastapi", "spring",
    "sql", "mysql", "postgresql", "mongodb", "redis", "elasticsearch",
    "aws", "azure", "gcp", "docker", "kubernetes", "terraform",
    "machine learning", "data science", "nlp", "computer vision", "pandas", "numpy", "tensorflow", "pytorch",
    "html", "css", "sass", "tailwind", "git", "ci/cd", "agile", "scrum",
    "rest api", "graphql", "microservices", "docker", "kubernetes", "jenkins",
    "html5", "css3", "bootstrap", "webpack", "npm", "yarn", "git hub", "gitlab"
])

def extract_email(text: str) -> str:
    email_regex = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,7}\b'
    match = re.search(email_regex, text)
    return match.group(0) if match else ""

def extract_phone(text: str) -> str:
    # A generic regex for different phone formats
    phone_regex = r'(\+\d{1,3}[\s.-]?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}'
    match = re.search(phone_regex, text)
    return match.group(0) if match else ""

def extract_linkedin(text: str) -> str:
    """Extract LinkedIn profile URL from resume text - handles multiple formats"""
    # Try multiple regex patterns for different LinkedIn URL formats
    patterns = [
        # Standard format with in/username
        r'(?:https?://)?(?:www\.)?linkedin\.com/in/[\w\-]+/?',
        # Alternative: just the username pattern
        r'linkedin\.com/in/([\w\-]+)',
        # LinkedIn with /profile
        r'(?:https?://)?(?:www\.)?linkedin\.com/company/[\w\-]+/?',
        # Just linkedin/username without .com
        r'linkedin/in/([\w\-]+)',
        # Shortened formats
        r'linkedin\.com/([\w\-]+)',
        # Search for URLs in general (linkedin mentions)
        r'(?:https?://)?linkedin\.com[^\s]+'
    ]
    
    for pattern in patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            url = match.group(0)
            # Clean up the URL
            if 'linkedin' in url.lower():
                # Ensure it has https://
                if not url.lower().startswith('http'):
                    url = 'https://' + url
                # Remove any trailing slashes or special chars
                url = url.rstrip('/')
                if url.endswith(')'):
                    url = url[:-1]
                return url
    
    return ""

def extract_github(text: str) -> str:
    """Extract GitHub profile URL from resume text - handles multiple formats"""
    # Try multiple patterns
    patterns = [
        # Standard github.com/username format
        r'(?:https?://)?(?:www\.)?github\.com/([\w\-]+)(?:/[\w\-]*)?',
        # Just github.com/username
        r'github\.com/([\w\-]+)',
        # Full URLs
        r'(?:https?://)?github\.com[^\s]+'
    ]
    
    for pattern in patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            url = match.group(0)
            # Clean up the URL
            if 'github' in url.lower():
                # Ensure it has https://
                if not url.lower().startswith('http'):
                    url = 'https://' + url
                # Remove trailing slashes or special chars
                url = url.rstrip('/')
                if url.endswith(')'):
                    url = url[:-1]
                return url
    
    return ""

def extract_name(text: str) -> str:
    """Extract name from resume - try spaCy first, fallback to simple heuristic"""
    try:
        nlp_model = get_nlp()
        if nlp_model:
            doc = nlp_model(text[:1000])
            for ent in doc.ents:
                if ent.label_ == "PERSON":
                    return ent.text
    except Exception as e:
        print(f"Error using spaCy: {e}")
    
    # Fallback: try to get first line as name
    lines = text.strip().split('\n')
    if lines:
        return lines[0][:50]  # First line, max 50 chars
    return "Unknown"

def extract_skills(text: str) -> List[str]:
    """Extract skills from text - works with or without spaCy"""
    found_skills = set()
    text_lower = text.lower()
    
    # Simple heuristic: look for known skills in the text
    for skill in KNOWN_SKILLS:
        # Check for exact word match or as part of longer word
        if skill in text_lower:
            found_skills.add(skill)
    
    # Try spaCy for additional NLP-based extraction if available
    try:
        nlp_model = get_nlp()
        if nlp_model:
            doc = nlp_model(text[:3000])  # Limit to first 3000 chars for performance
            for token in doc:
                if token.text.lower() in KNOWN_SKILLS:
                    found_skills.add(token.text.lower())
    except Exception as e:
        print(f"Warning: spaCy extraction failed: {e}")
    
    return sorted(list(found_skills))

def parse_resume(text: str) -> Dict[str, Any]:
    """
    Main entry point for parsing raw resume text into structured JSON.
    Works with or without spaCy model.
    """
    linkedin = extract_linkedin(text)
    github = extract_github(text)
    
    # Debug logging
    print(f"[Parser] LinkedIn extracted: {'YES' if linkedin else 'NO'} - {linkedin}")
    print(f"[Parser] GitHub extracted: {'YES' if github else 'NO'} - {github}")
    
    return {
        "name": extract_name(text),
        "email": extract_email(text),
        "phone": extract_phone(text),
        "linkedin": linkedin,
        "github": github,
        "skills": extract_skills(text),
        "raw_text_length": len(text)
    }
