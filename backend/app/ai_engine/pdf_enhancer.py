"""
PDF Resume Enhancement Module
Handles reading, enhancing, and generating optimized PDF resumes
"""

from io import BytesIO
from typing import Optional, Dict, Any, List
from PyPDF2 import PdfReader, PdfWriter
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak, Table, TableStyle
from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_JUSTIFY
import os


def create_enhanced_pdf(
    original_text: str,
    missing_skills: List[str],
    matching_skills: List[str],
    suggestions: List[str],
    ats_score: int
) -> BytesIO:
    """
    Create an enhanced PDF resume with improvements noted
    """
    buffer = BytesIO()
    
    # Create PDF document
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        topMargin=0.5 * inch,
        bottomMargin=0.5 * inch,
        leftMargin=0.75 * inch,
        rightMargin=0.75 * inch
    )
    
    styles = getSampleStyleSheet()
    story = []
    
    # Title style
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=18,
        textColor='#1e40af',
        spaceAfter=6,
        alignment=TA_CENTER,
        fontName='Helvetica-Bold'
    )
    
    # Header style
    header_style = ParagraphStyle(
        'Header',
        parent=styles['Heading2'],
        fontSize=12,
        textColor='#1e40af',
        spaceAfter=8,
        spaceBefore=8,
        fontName='Helvetica-Bold'
    )
    
    # Normal text style
    normal_style = ParagraphStyle(
        'CustomNormal',
        parent=styles['Normal'],
        fontSize=10,
        spaceAfter=4,
        alignment=TA_JUSTIFY
    )
    
    # Add title
    story.append(Paragraph("OPTIMIZED RESUME", title_style))
    story.append(Spacer(1, 0.1 * inch))
    
    # Add ATS Score banner
    score_text = f"<b>ATS Compatibility Score: {ats_score}%</b>"
    story.append(Paragraph(score_text, header_style))
    story.append(Spacer(1, 0.1 * inch))
    
    # Add matching skills section
    if matching_skills:
        story.append(Paragraph("✓ Matching Skills", header_style))
        skills_text = ", ".join(matching_skills[:10])
        story.append(Paragraph(f"<font color='green'>{skills_text}</font>", normal_style))
        story.append(Spacer(1, 0.1 * inch))
    
    # Add missing skills section with action items
    if missing_skills:
        story.append(Paragraph("+ Skills to Add", header_style))
        for skill in missing_skills[:8]:
            story.append(
                Paragraph(
                    f"<font color='red'>• {skill.title()}</font>",
                    normal_style
                )
            )
        story.append(Spacer(1, 0.1 * inch))
    
    # Add improvement suggestions
    if suggestions:
        story.append(Paragraph("Improvement Recommendations", header_style))
        for i, suggestion in enumerate(suggestions[:6], 1):
            # Clean up suggestion text
            clean_suggestion = suggestion.replace("✓ ", "").strip()
            story.append(
                Paragraph(
                    f"<b>{i}.</b> {clean_suggestion}",
                    normal_style
                )
            )
        story.append(Spacer(1, 0.2 * inch))
    
    # Add original resume content header
    story.append(Paragraph("ORIGINAL RESUME CONTENT", header_style))
    story.append(Spacer(1, 0.1 * inch))
    
    # Add original resume text
    lines = original_text.split('\n')
    for line in lines:
        line = line.strip()
        if not line:
            story.append(Spacer(1, 0.05 * inch))
        elif line.startswith('#'):
            # Headers
            level = len(line) - len(line.lstrip('#'))
            content = line.lstrip('#').strip()
            if level == 1:
                story.append(Paragraph(f"<b>{content}</b>", header_style))
            else:
                story.append(Paragraph(f"<u><b>{content}</b></u>", normal_style))
        elif line.startswith('- ') or line.startswith('• '):
            # Bullet points
            content = line[2:].strip()
            story.append(Paragraph(f"• {content}", normal_style))
        else:
            # Regular text
            story.append(Paragraph(line, normal_style))
    
    # Add footer
    story.append(Spacer(1, 0.2 * inch))
    story.append(Paragraph(
        "<i>Enhanced with AI Resume Optimization Tool</i>",
        ParagraphStyle(
            'Footer',
            parent=styles['Normal'],
            fontSize=8,
            textColor='#666666',
            alignment=TA_CENTER
        )
    ))
    
    # Build PDF
    try:
        doc.build(story)
    except Exception as e:
        print(f"PDF building error: {e}")
    
    buffer.seek(0)
    return buffer


def enhance_with_original_pdf(
    file_path: str,
    missing_skills: List[str],
    matching_skills: List[str],
    suggestions: List[str],
    ats_score: int,
    original_text: str
) -> BytesIO:
    """
    Try to enhance original PDF if it exists, otherwise create new PDF
    """
    
    try:
        # Try to read original PDF if it exists
        if file_path and os.path.exists(file_path):
            try:
                reader = PdfReader(file_path)
                
                # Create enhancement page
                enhancement_buffer = create_enhanced_pdf(
                    original_text,
                    missing_skills,
                    matching_skills,
                    suggestions,
                    ats_score
                )
                
                # Read enhancement PDF
                enhancement_reader = PdfReader(enhancement_buffer)
                
                # Merge: add enhancement page first, then original resume
                writer = PdfWriter()
                
                # Add enhancement page
                if enhancement_reader.pages:
                    writer.add_page(enhancement_reader.pages[0])
                
                # Add original resume pages
                for page in reader.pages:
                    writer.add_page(page)
                
                # Write to buffer
                output = BytesIO()
                writer.write(output)
                output.seek(0)
                return output
                
            except Exception as e:
                print(f"Could not merge with original PDF: {e}")
                # Fall back to creating new PDF
                return create_enhanced_pdf(
                    original_text,
                    missing_skills,
                    matching_skills,
                    suggestions,
                    ats_score
                )
        else:
            # No original file, create new PDF
            return create_enhanced_pdf(
                original_text,
                missing_skills,
                matching_skills,
                suggestions,
                ats_score
            )
            
    except Exception as e:
        print(f"PDF enhancement error: {e}")
        # Final fallback: create new PDF
        return create_enhanced_pdf(
            original_text,
            missing_skills,
            matching_skills,
            suggestions,
            ats_score
        )
