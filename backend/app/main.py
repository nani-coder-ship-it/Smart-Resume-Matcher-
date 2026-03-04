from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.routes import auth, resume, job, dashboard, improve
from app.database.session import engine, Base

# Important: This initializes all the defined models in the database automatically
# In a real production system, Alembic migrations should be used instead!
from app.models import user, resume as resume_model, match

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# Set all CORS enabled origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Update for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix=f"{settings.API_V1_STR}/auth", tags=["auth"])
app.include_router(resume.router, prefix=f"{settings.API_V1_STR}/resume", tags=["resume"])
app.include_router(job.router, prefix=f"{settings.API_V1_STR}/job", tags=["job match"])
app.include_router(dashboard.router, prefix=f"{settings.API_V1_STR}/dashboard", tags=["dashboard analytics"])
app.include_router(improve.router, tags=["resume-improvement"])

@app.get("/")
def root():
    return {"message": "Welcome to the Smart Resume Analyzer API", "status": "running"}

@app.get("/health")
def health_check():
    """Health check endpoint to verify the API is running"""
    return {
        "status": "healthy",
        "project": settings.PROJECT_NAME,
        "version": settings.VERSION
    }
