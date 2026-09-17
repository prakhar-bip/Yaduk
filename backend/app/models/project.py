from sqlalchemy import Column, Integer, String, Text, JSON, ForeignKey, Boolean, DateTime
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.db.database import Base

class ProjectIdea(Base):
    __tablename__ = "project_ideas"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"))
    
    name = Column(String, index=True)
    problem = Column(Text)
    solution = Column(Text)
    target_users = Column(String)
    difficulty_level = Column(String)
    estimated_development_time = Column(String)
    required_skills = Column(JSON)
    
    # Analysis fields
    skill_match_score = Column(Integer, nullable=True)
    interest_match_score = Column(Integer, nullable=True)
    feasibility_explanation = Column(Text, nullable=True)
    is_selected = Column(Boolean, default=False)
    
    student = relationship("Student")

class ProjectBlueprint(Base):
    __tablename__ = "project_blueprints"

    id = Column(Integer, primary_key=True, index=True)
    project_idea_id = Column(Integer, ForeignKey("project_ideas.id"), unique=True)
    
    overview = Column(JSON)
    features = Column(JSON)
    tech_stack = Column(JSON)
    system_architecture = Column(JSON)
    development_roadmap = Column(JSON)
    challenges_and_solutions = Column(JSON)

    project_idea = relationship("ProjectIdea", backref="blueprint")

class MentorMessage(Base):
    __tablename__ = "mentor_messages"

    id = Column(Integer, primary_key=True, index=True)
    project_idea_id = Column(Integer, ForeignKey("project_ideas.id"), index=True)
    sender = Column(String)  # 'student' or 'mentor'
    message = Column(Text)
    blueprint_updated = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    project_idea = relationship("ProjectIdea", backref="mentor_messages")
