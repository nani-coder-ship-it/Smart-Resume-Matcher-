# Smart Resume Matcher 🚀

An intelligent AI-powered resume analysis and improvement platform that helps job seekers optimize their resumes for maximum impact. Get instant feedback, AI-powered enhancement suggestions, and precise editing recommendations tailored to specific job descriptions.

## ✨ Features

### 📋 Resume Management
- **Upload & Parse**: Drag-and-drop PDF resume uploads with automatic text extraction
- **Multi-Resume Support**: Manage multiple resumes for different job types
- **Delete Option**: Easily remove resumes you no longer need
- **Resume History**: View all uploaded resumes with current processing status

### 🤖 AI-Powered Analysis
- **ATS Score Calculation**: Get an ATS (Applicant Tracking System) compatibility score (0-100%)
- **Skill Extraction**: Automatic identification of 50+ technical and professional skills
- **Job Matching**: Compare your resume against job descriptions to find skill gaps
- **Real-time Processing**: Background processing with live status updates

### 💡 Smart Improvement Features
- **Automated PDF Enhancement**: Direct PDF editing with AI improvements
- **Edit Suggestions**: Get structured editing recommendations with specific changes
- **Missing Skills Identification**: See exactly which skills you need to add
- **Bullet Point Optimization**: Weak verb detection and replacement suggestions
- **LinkedIn/GitHub Integration**: Extract information from LinkedIn and GitHub profiles

### 📊 Analytics & Insights
- **Match Score**: Visual representation of how well your resume matches the job
- **Matching Skills**: Green badges showing skills you already have
- **Missing Skills**: Red badges highlighting skills to add
- **Improvement Tips**: AI-generated actionable tips for resume optimization
- **Dashboard Summary**: Overview of your resume performance across all uploads

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 16.1.6 (with Turbopack)
- **UI Library**: React 19+
- **Styling**: Tailwind CSS v4
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **State Management**: React Hooks
- **Language**: TypeScript

### Backend
- **Framework**: FastAPI (Python)
- **ORM**: SQLAlchemy
- **Database**: SQLite
- **PDF Processing**: PyPDF2, ReportLab
- **NLP**: Pattern matching & regex-based extraction
- **Validation**: Pydantic v2.6.4
- **Authentication**: JWT tokens

### Infrastructure
- **API**: RESTful JSON API
- **File Storage**: Local filesystem with organized upload directory
- **Background Processing**: FastAPI BackgroundTasks
- **Development Server**: Uvicorn

## 📦 Installation & Setup

### Prerequisites
- Python 3.8+
- Node.js 18+
- npm or yarn

### Backend Setup
```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start the server
python -m uvicorn app.main:app --reload
# Server runs at http://localhost:8000
```

### Frontend Setup
```bash
# From project root directory
# Install dependencies
npm install
# or
yarn install

# Start development server
npm run dev
# or
yarn dev
# Server runs at http://localhost:3000
```

## 🚀 Usage

### 1. **Upload Your Resume**
- Navigate to Dashboard → Upload Resume
- Drag and drop your PDF resume
- System automatically extracts text and processes it

### 2. **Analyze Against Job Description**
- Go to Dashboard → Job Match
- Select your resume
- Enter job title and full job description
- Click "Analyze & Get Suggestions"
- View ATS score, matching/missing skills, and improvement tips

### 3. **Get Editing Suggestions**
- Go to Dashboard → Edit Suggestions
- Select resume and job description
- Get structured editing recommendations
- Copy suggestions directly to your resume

### 4. **Download Improved Resume**
- Go to Dashboard → Job Match
- After analysis, download the AI-improved PDF
- Use the enhanced version for applications

### 5. **Manage Resumes**
- Go to Dashboard → Upload Resume
- View all uploaded resumes in Resume History
- Click delete button (trash icon) to remove unwanted resumes

## 📁 Project Structure

```
Smart Resume Matcher/
├── backend/
│   ├── app/
│   │   ├── ai_engine/
│   │   │   ├── ats_scorer.py           # ATS score calculation
│   │   │   ├── job_matcher.py          # Job matching logic
│   │   │   ├── parser.py               # NLP resume parsing
│   │   │   ├── real_resume_enhancer.py # Real resume editing
│   │   │   ├── resume_enhancer.py      # Orchestration
│   │   │   ├── pdf_enhancer.py         # PDF generation
│   │   │   └── edit_suggestion_engine.py # Editing suggestions
│   │   ├── routes/
│   │   │   ├── auth.py                 # Authentication endpoints
│   │   │   ├── resume.py               # Resume management (with DELETE)
│   │   │   ├── job.py                  # Job posting endpoints
│   │   │   └── improve.py              # Resume improvement endpoints
│   │   ├── models/
│   │   ├── schemas/
│   │   ├── services/
│   │   ├── database/
│   │   └── main.py
│   ├── requirements.txt
│   ├── Dockerfile
│   └── docker-compose.yml
├── src/
│   ├── app/
│   │   ├── dashboard/
│   │   │   ├── page.tsx                # Dashboard overview
│   │   │   ├── upload/                 # Resume upload page (with delete)
│   │   │   ├── match/                  # Job matching page
│   │   │   ├── improve/                # PDF download page
│   │   │   └── edit/                   # Edit suggestions page
│   │   ├── login/
│   │   ├── register/
│   │   └── layout.tsx
│   ├── components/
│   │   ├── ui/
│   │   └── Navbar.tsx
│   ├── context/
│   │   └── AuthContext.tsx
│   └── lib/
│       └── api.ts
├── package.json
├── tsconfig.json
├── next.config.ts
└── README.md
```

## 🔑 Key API Endpoints

### Resume Management
```
POST   /api/v1/resume/upload           # Upload a new resume
GET    /api/v1/resume/                 # Get all user's resumes
GET    /api/v1/resume/{resume_id}      # Get resume details
DELETE /api/v1/resume/{resume_id}      # Delete a resume ✨ NEW
```

### Resume Analysis & Improvement
```
POST   /api/v1/resume-improve/optimize                  # Analyze resume against job
POST   /api/v1/resume-improve/get-edit-suggestions      # Get editing suggestions ✨ NEW
POST   /api/v1/resume-improve/generate-edited-pdf       # Generate improved PDF
```

### Authentication
```
POST   /api/v1/auth/register           # Register new user
POST   /api/v1/auth/login              # Login user
POST   /api/v1/auth/logout             # Logout user
```

## 🎯 How It Works

### Resume Analysis Flow
1. **Upload** → PDF extracted and stored
2. **Parse** → NLP extracts text, skills, experience
3. **Score** → ATS score calculated based on job description
4. **Analyze** → Job requirements compared against resume
5. **Suggest** → AI generates improvement recommendations
6. **Enhance** → PDF generated with improvements applied

### Skill Detection
- 50+ common technical skills recognized
- Regex-based pattern matching for flexibility
- Supports: Programming languages, frameworks, databases, cloud platforms, tools
- Examples: Python, React, AWS, Docker, Kubernetes, etc.

## 🔐 Authentication

- JWT token-based authentication
- Secure password hashing
- Protected API routes
- Session management

## 📊 Database Schema

- **Users**: User accounts and authentication
- **Resumes**: Uploaded resume files and metadata
- **Jobs**: Job postings and descriptions (for matching)
- **Matches**: Resume-job matching results

## 🚀 Deployment

### Docker Deployment
```bash
# Build and run with Docker Compose
docker-compose up --build
```

### Environment Variables
```
DATABASE_URL=sqlite:///./resume_matcher.db
JWT_SECRET=your-secret-key
DEBUG=False
```

## 💡 Best Practices

1. **Use complete job descriptions** for best matching results
2. **Update your skills section** with all relevant technologies
3. **Use quantifiable metrics** in bullet points (e.g., "increased by 25%")
4. **Keep resumes to 1-2 pages** for ATS compatibility
5. **Test with multiple job descriptions** to understand patterns

## 🐛 Troubleshooting

### PDF Upload Fails
- Ensure PDF file is not corrupted
- Check file size (recommended < 5MB)
- Try with a different PDF reader

### Low ATS Score
- Add missing skills relevant to the job
- Improve bullet point descriptions
- Use industry keywords from job description

### Slow Processing
- Reduce resume file size
- Wait for background processing to complete
- Check server logs for errors

## 📝 Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see LICENSE file for details.

## 👥 Support

For issues, questions, or feedback:
- Open an issue on GitHub
- Contact: support@smartresumematcher.com
- Documentation: [GitHub Wiki](https://github.com/yourusername/smart-resume-matcher/wiki)

## 🎉 Features Implemented

✅ Resume upload and PDF parsing  
✅ ATS score calculation  
✅ Skill extraction (50+ skills)  
✅ Job matching analysis  
✅ Real resume enhancement  
✅ PDF generation with improvements  
✅ Edit suggestions with structured recommendations  
✅ Multi-resume management  
✅ **Resume deletion** ✨ NEW  
✅ Dashboard overview  
✅ LinkedIn/GitHub extraction  
✅ User authentication  
✅ Professional UI/UX  

---

**Made with ❤️ to help job seekers land their dream jobs!**
