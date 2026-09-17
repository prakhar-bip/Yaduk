import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Yaduk AI Backend"
    API_V1_STR: str = "/api"
    
    POSTGRES_SERVER: str = os.getenv("POSTGRES_SERVER", "localhost")
    POSTGRES_USER: str = os.getenv("POSTGRES_USER", "postgres")
    POSTGRES_PASSWORD: str = os.getenv("POSTGRES_PASSWORD", "postgres")
    POSTGRES_DB: str = os.getenv("POSTGRES_DB", "yaduk")
    POSTGRES_PORT: str = os.getenv("POSTGRES_PORT", "5432")
    
    SQLALCHEMY_DATABASE_URI: str = os.getenv("SQLALCHEMY_DATABASE_URI", f"postgresql://{POSTGRES_USER}:{POSTGRES_PASSWORD}@{POSTGRES_SERVER}:{POSTGRES_PORT}/{POSTGRES_DB}")
    
    # Environment mode: 'development' / 'production' powered 100% by zero-cost Nvidia NIM API
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    
    # Google Cloud Vertex AI settings (PERMANENTLY DISABLED to prevent GCP charges)
    USE_VERTEX_AI: bool = False
    GCP_PROJECT_ID: str = ""
    GCP_LOCATION: str = ""
    GCP_PRIMARY_MODEL: str = ""
    GCP_SECONDARY_MODEL: str = ""
    GCP_MODEL: str = ""

    # Nvidia AI settings (Zero-Cost Free Tier LLM)
    NVIDIA_API_KEY: str = os.getenv("NVIDIA_API_KEY", "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")
    NVIDIA_BASE_URL: str = os.getenv("NVIDIA_BASE_URL", "https://integrate.api.nvidia.com/v1")
    NVIDIA_MODEL: str = os.getenv("NVIDIA_MODEL", "nvidia/nemotron-3-ultra-550b-a55b")

    # JWT Authentication settings
    JWT_SECRET_KEY: str = os.getenv("JWT_SECRET_KEY", "yaduk-super-secret-key-yaduka-hackathon-2026-auth-jwt")
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days

    class Config:
        env_file = (
            str(os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), ".env")),
            ".env"
        )
        extra = "ignore"

settings = Settings()
