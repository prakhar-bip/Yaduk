from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class ProjectIdeaBase(BaseModel):
    name: str
    problem: str
    solution: str
    target_users: str
    difficulty_level: str
    estimated_development_time: str
    required_skills: List[str]

class ProjectIdeaCreate(ProjectIdeaBase):
    student_id: int
    skill_match_score: Optional[int] = None
    interest_match_score: Optional[int] = None
    feasibility_explanation: Optional[str] = None

class ProjectIdeaResponse(ProjectIdeaBase):
    id: int
    student_id: int
    skill_match_score: Optional[int] = None
    interest_match_score: Optional[int] = None
    feasibility_explanation: Optional[str] = None
    is_selected: bool = False

    class Config:
        from_attributes = True

class ProjectIdeaRefineRequest(BaseModel):
    student_id: int
    feedback: str

class ProjectBlueprintResponse(BaseModel):
    id: int
    project_idea_id: int
    overview: dict
    features: dict
    tech_stack: List[dict]
    system_architecture: dict
    development_roadmap: List[dict]
    challenges_and_solutions: List[dict]

    class Config:
        from_attributes = True

class MentorChatRequest(BaseModel):
    message: str

class MentorMessageResponse(BaseModel):
    id: int
    sender: str
    message: str
    blueprint_updated: bool
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class MentorChatResponse(BaseModel):
    mentor_response: str
    blueprint_updated: bool
    blueprint: Optional[ProjectBlueprintResponse] = None
