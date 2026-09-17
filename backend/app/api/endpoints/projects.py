from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.db.database import get_db
from app.models.student import Student
from app.models.project import ProjectIdea, ProjectBlueprint, MentorMessage
from app.schemas.project import (
    ProjectIdeaResponse,
    ProjectIdeaCreate,
    ProjectIdeaRefineRequest,
    ProjectBlueprintResponse,
    MentorChatRequest,
    MentorChatResponse,
    MentorMessageResponse
)
from app.services.ai_service import (
    generate_project_ideas,
    refine_project_ideas,
    analyze_project_feasibility,
    generate_project_blueprint,
    mentor_chat_and_refine
)
from app.core.activity_logger import log_activity

router = APIRouter()

@router.post("/generate/{student_id}", response_model=List[ProjectIdeaResponse])
def generate_projects(student_id: int, db: Session = Depends(get_db)):
    """
    Step 3: Generate personalized project ideas based on the student profile using AI.
    """
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
        
    student_dict = {
        "field_of_study": student.field_of_study,
        "technical_skills": student.technical_skills,
        "experience_level": student.experience_level,
        "areas_of_interest": student.areas_of_interest,
        "career_goals": student.career_goals,
        "available_time": student.available_time,
    }
    
    # Generate ideas from AI
    try:
        ideas_data = generate_project_ideas(student_dict)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI Generation failed: {str(e)}")
        
    saved_ideas = []
    for idea in ideas_data:
        db_idea = ProjectIdea(
            student_id=student.id,
            name=idea.get("name"),
            problem=idea.get("problem"),
            solution=idea.get("solution"),
            target_users=idea.get("target_users"),
            difficulty_level=idea.get("difficulty_level"),
            estimated_development_time=idea.get("estimated_development_time"),
            required_skills=idea.get("required_skills", [])
        )
        db.add(db_idea)
        saved_ideas.append(db_idea)
        
    db.commit()
    for idea in saved_ideas:
        db.refresh(idea)
        
    return saved_ideas

@router.post("/refine", response_model=List[ProjectIdeaResponse])
def refine_projects(request: ProjectIdeaRefineRequest, db: Session = Depends(get_db)):
    """
    Step 5: Refine project ideas based on student feedback.
    """
    student = db.query(Student).filter(Student.id == request.student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
        
    # Get previous ideas to give AI context
    previous_ideas = db.query(ProjectIdea).filter(ProjectIdea.student_id == student.id).order_by(ProjectIdea.id.desc()).limit(3).all()
    
    student_dict = {
        "field_of_study": student.field_of_study,
        "technical_skills": student.technical_skills,
        "experience_level": student.experience_level,
    }
    
    ideas_dict_list = [
        {
            "name": i.name,
            "problem": i.problem,
            "solution": i.solution,
            "difficulty_level": i.difficulty_level
        } for i in previous_ideas
    ]
    
    try:
        refined_ideas_data = refine_project_ideas(student_dict, ideas_dict_list, request.feedback)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI Refinement failed: {str(e)}")
        
    saved_ideas = []
    for idea in refined_ideas_data:
        db_idea = ProjectIdea(
            student_id=student.id,
            name=idea.get("name"),
            problem=idea.get("problem"),
            solution=idea.get("solution"),
            target_users=idea.get("target_users"),
            difficulty_level=idea.get("difficulty_level"),
            estimated_development_time=idea.get("estimated_development_time"),
            required_skills=idea.get("required_skills", [])
        )
        db.add(db_idea)
        saved_ideas.append(db_idea)
        
    db.commit()
    for idea in saved_ideas:
        db.refresh(idea)
        
    return saved_ideas

@router.post("/{idea_id}/analyze-feasibility", response_model=ProjectIdeaResponse)
def analyze_feasibility(idea_id: int, db: Session = Depends(get_db)):
    """
    Step 6: Analyze feasibility of the selected project idea.
    """
    project_idea = db.query(ProjectIdea).filter(ProjectIdea.id == idea_id).first()
    if not project_idea:
        raise HTTPException(status_code=404, detail="Project idea not found")
        
    student = project_idea.student
    
    student_dict = {
        "field_of_study": student.field_of_study,
        "technical_skills": student.technical_skills,
        "experience_level": student.experience_level,
        "available_time": student.available_time,
    }
    
    idea_dict = {
        "name": project_idea.name,
        "problem": project_idea.problem,
        "difficulty_level": project_idea.difficulty_level,
        "estimated_development_time": project_idea.estimated_development_time,
        "required_skills": project_idea.required_skills
    }
    
    try:
        analysis = analyze_project_feasibility(student_dict, idea_dict)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI Feasibility Analysis failed: {str(e)}")
        
    project_idea.skill_match_score = analysis.get("skill_match_score")
    project_idea.interest_match_score = analysis.get("interest_match_score")
    project_idea.feasibility_explanation = analysis.get("feasibility_explanation")
    
    db.commit()
    db.refresh(project_idea)
    
    return project_idea

@router.post("/{idea_id}/select", response_model=ProjectIdeaResponse)
def select_project(idea_id: int, db: Session = Depends(get_db)):
    """
    Step 7: Final Project Selection. Mark the idea as selected.
    """
    project_idea = db.query(ProjectIdea).filter(ProjectIdea.id == idea_id).first()
    if not project_idea:
        raise HTTPException(status_code=404, detail="Project idea not found")
        
    project_idea.is_selected = True
    db.commit()
    db.refresh(project_idea)
    log_activity(
        agent="Project Selection Agent [Database]",
        success=True,
        error=None,
        warning_reason=None
    )
    return project_idea

@router.post("/{idea_id}/blueprint", response_model=ProjectBlueprintResponse)
def create_or_get_blueprint(idea_id: int, force_regenerate: bool = False, db: Session = Depends(get_db)):
    """
    Step 8 & 9: Complete Project Blueprint Generation (AI Project Architect).
    Generates a full technical blueprint and roadmap for the selected project.
    """
    project_idea = db.query(ProjectIdea).filter(ProjectIdea.id == idea_id).first()
    if not project_idea:
        raise HTTPException(status_code=404, detail="Project idea not found")
        
    existing_blueprint = db.query(ProjectBlueprint).filter(ProjectBlueprint.project_idea_id == idea_id).first()
    if existing_blueprint and not force_regenerate:
        return existing_blueprint
        
    student = project_idea.student
    student_dict = {
        "field_of_study": student.field_of_study,
        "technical_skills": student.technical_skills,
        "programming_languages": student.programming_languages,
        "frameworks_and_tools": student.frameworks_and_tools,
        "experience_level": student.experience_level,
        "available_time": student.available_time,
        "career_goals": student.career_goals
    }
    
    idea_dict = {
        "name": project_idea.name,
        "problem": project_idea.problem,
        "solution": project_idea.solution,
        "target_users": project_idea.target_users,
        "difficulty_level": project_idea.difficulty_level,
        "estimated_development_time": project_idea.estimated_development_time,
        "required_skills": project_idea.required_skills
    }
    
    try:
        blueprint_data = generate_project_blueprint(student_dict, idea_dict)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI Blueprint Generation failed: {str(e)}")
        
    if existing_blueprint:
        existing_blueprint.overview = blueprint_data.get("overview", {})
        existing_blueprint.features = blueprint_data.get("features", {})
        existing_blueprint.tech_stack = blueprint_data.get("tech_stack", [])
        existing_blueprint.system_architecture = blueprint_data.get("system_architecture", {})
        existing_blueprint.development_roadmap = blueprint_data.get("development_roadmap", [])
        existing_blueprint.challenges_and_solutions = blueprint_data.get("challenges_and_solutions", [])
        db.commit()
        db.refresh(existing_blueprint)
        return existing_blueprint
    else:
        new_blueprint = ProjectBlueprint(
            project_idea_id=idea_id,
            overview=blueprint_data.get("overview", {}),
            features=blueprint_data.get("features", {}),
            tech_stack=blueprint_data.get("tech_stack", []),
            system_architecture=blueprint_data.get("system_architecture", {}),
            development_roadmap=blueprint_data.get("development_roadmap", []),
            challenges_and_solutions=blueprint_data.get("challenges_and_solutions", [])
        )
        db.add(new_blueprint)
        db.commit()
        db.refresh(new_blueprint)
        return new_blueprint

@router.get("/{idea_id}/blueprint", response_model=ProjectBlueprintResponse)
def get_blueprint(idea_id: int, db: Session = Depends(get_db)):
    """
    Fetch the existing Project Blueprint for a given project idea.
    """
    blueprint = db.query(ProjectBlueprint).filter(ProjectBlueprint.project_idea_id == idea_id).first()
    if not blueprint:
        raise HTTPException(status_code=404, detail="Blueprint not found for this project idea. Generate it first using POST.")
    log_activity(
        agent="Project Blueprint Retriever Agent [Database]",
        success=True,
        error=None,
        warning_reason=None
    )
    return blueprint

@router.post("/{idea_id}/mentor/chat", response_model=MentorChatResponse)
def chat_with_mentor(idea_id: int, request: MentorChatRequest, db: Session = Depends(get_db)):
    """
    Steps 10 & 11: Interactive AI Project Mentor & Continuous Project Refinement.
    Allows student to discuss the project, ask technical questions, request technology
    stack changes, or simplify features. Automatically updates the Project Blueprint
    if architectural changes are agreed upon.
    """
    project_idea = db.query(ProjectIdea).filter(ProjectIdea.id == idea_id).first()
    if not project_idea:
        raise HTTPException(status_code=404, detail="Project idea not found")
        
    blueprint = db.query(ProjectBlueprint).filter(ProjectBlueprint.project_idea_id == idea_id).first()
    if not blueprint:
        raise HTTPException(status_code=400, detail="Please generate the Project Blueprint first before starting mentorship.")

    student = project_idea.student
    student_dict = {
        "field_of_study": student.field_of_study,
        "technical_skills": student.technical_skills,
        "programming_languages": student.programming_languages,
        "frameworks_and_tools": student.frameworks_and_tools,
        "experience_level": student.experience_level,
        "available_time": student.available_time,
        "career_goals": student.career_goals
    }
    
    idea_dict = {
        "name": project_idea.name,
        "problem": project_idea.problem,
        "solution": project_idea.solution,
        "difficulty_level": project_idea.difficulty_level,
        "estimated_development_time": project_idea.estimated_development_time,
        "required_skills": project_idea.required_skills
    }

    current_blueprint_dict = {
        "overview": blueprint.overview,
        "features": blueprint.features,
        "tech_stack": blueprint.tech_stack,
        "system_architecture": blueprint.system_architecture,
        "development_roadmap": blueprint.development_roadmap,
        "challenges_and_solutions": blueprint.challenges_and_solutions
    }

    # Fetch recent chat messages for context
    previous_messages = db.query(MentorMessage).filter(MentorMessage.project_idea_id == idea_id).order_by(MentorMessage.id.asc()).all()
    history_list = [{"sender": m.sender, "message": m.message} for m in previous_messages]

    # Save student message
    student_msg_record = MentorMessage(
        project_idea_id=idea_id,
        sender="student",
        message=request.message,
        blueprint_updated=False
    )
    db.add(student_msg_record)
    db.commit()

    # Call AI mentor service
    try:
        mentor_result = mentor_chat_and_refine(
            student_profile=student_dict,
            project_idea=idea_dict,
            current_blueprint=current_blueprint_dict,
            chat_history=history_list,
            student_message=request.message
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI Mentor failed: {str(e)}")

    mentor_text = mentor_result.get("mentor_response", "I have reviewed your request.")
    blueprint_updated = mentor_result.get("blueprint_updated", False)
    updated_blueprint_data = mentor_result.get("updated_blueprint")

    # If the blueprint was refined during the discussion, persist changes
    if blueprint_updated and updated_blueprint_data:
        if "overview" in updated_blueprint_data and updated_blueprint_data["overview"]:
            blueprint.overview = updated_blueprint_data["overview"]
        if "features" in updated_blueprint_data and updated_blueprint_data["features"]:
            blueprint.features = updated_blueprint_data["features"]
        if "tech_stack" in updated_blueprint_data and updated_blueprint_data["tech_stack"]:
            blueprint.tech_stack = updated_blueprint_data["tech_stack"]
        if "system_architecture" in updated_blueprint_data and updated_blueprint_data["system_architecture"]:
            blueprint.system_architecture = updated_blueprint_data["system_architecture"]
        if "development_roadmap" in updated_blueprint_data and updated_blueprint_data["development_roadmap"]:
            blueprint.development_roadmap = updated_blueprint_data["development_roadmap"]
        if "challenges_and_solutions" in updated_blueprint_data and updated_blueprint_data["challenges_and_solutions"]:
            blueprint.challenges_and_solutions = updated_blueprint_data["challenges_and_solutions"]
        db.commit()
        db.refresh(blueprint)

    # Save mentor response
    mentor_msg_record = MentorMessage(
        project_idea_id=idea_id,
        sender="mentor",
        message=mentor_text,
        blueprint_updated=blueprint_updated
    )
    db.add(mentor_msg_record)
    db.commit()

    return MentorChatResponse(
        mentor_response=mentor_text,
        blueprint_updated=blueprint_updated,
        blueprint=blueprint if blueprint_updated else None
    )

@router.get("/{idea_id}/mentor/history", response_model=List[MentorMessageResponse])
def get_mentor_history(idea_id: int, db: Session = Depends(get_db)):
    """
    Retrieve the full chat history between the student and the AI mentor.
    """
    messages = db.query(MentorMessage).filter(MentorMessage.project_idea_id == idea_id).order_by(MentorMessage.id.asc()).all()
    log_activity(
        agent="Mentor Chat History Agent [Database]",
        success=True,
        error=None,
        warning_reason=None
    )
    return messages


