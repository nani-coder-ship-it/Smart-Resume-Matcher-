from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str = "Smart Resume Analyzer API"
    VERSION: str = "2.0.0"
    API_V1_STR: str = "/api/v1"
    
    SECRET_KEY: str = "your-super-secret-key-change-in-production"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7 # 7 days
    
    POSTGRES_SERVER: str = "localhost"
    POSTGRES_USER: str = "postgres"
    POSTGRES_PASSWORD: str = "postgres"
    POSTGRES_DB: str = "resume_analyzer"
    POSTGRES_PORT: str = "5432"

    @property
    def SQLALCHEMY_DATABASE_URI(self) -> str:
        # Switching to SQLite for local development since Docker is unavailable
        return "sqlite:///./app.db"
    
    @property
    def ASYNC_SQLALCHEMY_DATABASE_URI(self) -> str:
        return "sqlite+aiosqlite:///./app.db"

    model_config = SettingsConfigDict(env_file=".env", case_sensitive=True)

settings = Settings()
