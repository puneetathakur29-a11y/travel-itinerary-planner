from typing import List, Optional
from pydantic_settings import BaseSettings
from pydantic import Field


class Settings(BaseSettings):
    PROJECT_NAME: str = "Personalized Travel Itinerary Planner"
    API_V1_STR: str = "/api/v1"
    ENVIRONMENT: str = "development"
    PORT: int = 8000
    HOST: str = "0.0.0.0"
    
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://localhost:8080",
        "*"
    ]

    # Supabase Configuration
    SUPABASE_URL: Optional[str] = Field(default=None, env="SUPABASE_URL")
    SUPABASE_KEY: Optional[str] = Field(default=None, env="SUPABASE_KEY")

    # LLM API Keys
    GEMINI_API_KEY: Optional[str] = Field(default=None, env="GEMINI_API_KEY")
    OPENAI_API_KEY: Optional[str] = Field(default=None, env="OPENAI_API_KEY")
    AI_MODEL_NAME: str = Field(default="gemini-1.5-pro", env="AI_MODEL_NAME")

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
