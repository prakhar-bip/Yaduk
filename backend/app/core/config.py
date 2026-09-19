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
    
    # Environment mode: 'development' / 'production'
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "production")

    # AWS Bedrock Settings (Primary Track 2 Agent Architecture)
    AWS_BEDROCK_ENABLED: bool = os.getenv("AWS_BEDROCK_ENABLED", "true").lower() in ("true", "1")
    AWS_REGION: str = os.getenv("AWS_REGION", os.getenv("AWS_DEFAULT_REGION", "us-east-1"))
    AWS_ACCESS_KEY_ID: str = os.getenv("AWS_ACCESS_KEY_ID", "")
    AWS_SECRET_ACCESS_KEY: str = os.getenv("AWS_SECRET_ACCESS_KEY", "")
    AWS_BEDROCK_MODEL: str = os.getenv("AWS_BEDROCK_MODEL", "anthropic.claude-3-5-sonnet-20241022-v2:0")

    # OpenRouter Fallback AI Settings (Secondary Tier: Reasoning & Nemotron Ultra)
    OPENROUTER_API_KEY: str = os.getenv("OPENROUTER_API_KEY", "")
    OPENROUTER_BASE_URL: str = os.getenv("OPENROUTER_BASE_URL", "https://openrouter.ai/api/v1")
    OPENROUTER_MODEL: str = os.getenv("OPENROUTER_MODEL", "nvidia/nemotron-3-ultra-550b-a55b:free")
    OPENROUTER_TIMEOUT: float = float(os.getenv("OPENROUTER_TIMEOUT", "35.0"))

    # Groq Fallback AI Settings (Tertiary Tier: High-Throughput Reasoning Engine)
    GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "")
    GROQ_BASE_URL: str = os.getenv("GROQ_BASE_URL", "https://api.groq.com/openai/v1")
    GROQ_MODEL: str = os.getenv("GROQ_MODEL", "openai/gpt-oss-120b")
    GROQ_TIMEOUT: float = float(os.getenv("GROQ_TIMEOUT", "25.0"))

    # Backward-compatible aliases for client interfaces
    NVIDIA_API_KEY: str = os.getenv("NVIDIA_API_KEY", OPENROUTER_API_KEY or GROQ_API_KEY)
    NVIDIA_BASE_URL: str = os.getenv("NVIDIA_BASE_URL", OPENROUTER_BASE_URL)
    NVIDIA_MODEL: str = os.getenv("NVIDIA_MODEL", OPENROUTER_MODEL)

    # JWT Authentication settings
    JWT_SECRET_KEY: str = os.getenv("JWT_SECRET_KEY", "yaduk-super-secret-key-core-auth-jwt")
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days

    class Config:
        env_file = (
            str(os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), ".env")),
            ".env"
        )
        extra = "ignore"

settings = Settings()
