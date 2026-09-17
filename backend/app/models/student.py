from sqlalchemy import Column, Integer, String, JSON, Text
from app.db.database import Base

class Student(Base):
    __tablename__ = "students"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=True, index=True)
    field_of_study = Column(String, index=True)
    year_of_study = Column(String)
    
    # Store lists as JSON
    technical_skills = Column(JSON)
    programming_languages = Column(JSON)
    frameworks_and_tools = Column(JSON)
    
    ai_ml_knowledge = Column(String)
    previous_projects = Column(Text)
    experience_level = Column(String)
    
    areas_of_interest = Column(JSON)
    preferred_project_domains = Column(JSON)
    career_goals = Column(Text)
    
    project_preferences = Column(Text)
    available_time = Column(String)
    team_size = Column(Integer)
    available_resources = Column(Text)
    preferred_project_complexity = Column(String)
