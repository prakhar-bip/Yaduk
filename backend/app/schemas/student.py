from pydantic import BaseModel
from typing import List, Optional

class StudentBase(BaseModel):
    user_id: Optional[int] = None
    field_of_study: str
    year_of_study: str
    technical_skills: List[str]
    programming_languages: List[str]
    frameworks_and_tools: List[str]
    ai_ml_knowledge: str
    previous_projects: str
    experience_level: str
    areas_of_interest: List[str]
    preferred_project_domains: List[str]
    career_goals: str
    project_preferences: str
    available_time: str
    team_size: int
    available_resources: str
    preferred_project_complexity: str

class StudentCreate(StudentBase):
    pass

class StudentResponse(StudentBase):
    id: int

    class Config:
        from_attributes = True
