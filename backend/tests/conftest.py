import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.db.database import Base, get_db
from app.main import app

# In-memory SQLite for testing
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="function")
def db_session():
    """Create a fresh database session for each test."""
    Base.metadata.create_all(bind=engine)
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def client(db_session):
    """Create a FastAPI test client with overridden DB dependency."""
    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()


@pytest.fixture
def sample_student_payload():
    """Sample student discovery payload for testing."""
    return {
        "field_of_study": "Computer Science",
        "year_of_study": "4th Year",
        "technical_skills": ["Python", "React", "SQL"],
        "programming_languages": ["Python", "TypeScript", "JavaScript"],
        "frameworks_and_tools": ["FastAPI", "React", "Docker"],
        "ai_ml_knowledge": "Intermediate",
        "previous_projects": "Built a chat application and a todo app",
        "experience_level": "Intermediate",
        "areas_of_interest": ["AI/ML", "Web Development"],
        "preferred_project_domains": ["Healthcare", "EdTech"],
        "career_goals": "Full-stack AI engineer",
        "project_preferences": "Full-stack with AI integration",
        "available_time": "15-20 hours/week",
        "team_size": 2,
        "available_resources": "GitHub, PostgreSQL, Docker",
        "preferred_project_complexity": "Production-grade"
    }


@pytest.fixture
def registered_user(client):
    """Register a test user and return the response data."""
    response = client.post("/api/auth/register", json={
        "email": "test@yaduk.dev",
        "password": "testpass123",
        "full_name": "Test Student"
    })
    return response.json()


@pytest.fixture
def auth_headers(registered_user):
    """Return Authorization headers for authenticated requests."""
    return {"Authorization": f"Bearer {registered_user['access_token']}"}
