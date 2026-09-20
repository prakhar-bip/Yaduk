"""Initial schema — users, students, project_ideas, project_blueprints, mentor_messages

Revision ID: 001_initial
Revises: None
Create Date: 2026-09-20
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = "001_initial"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Users table
    op.create_table(
        "users",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("email", sa.String(), nullable=False, unique=True, index=True),
        sa.Column("hashed_password", sa.String(), nullable=False),
        sa.Column("full_name", sa.String(), nullable=True),
        sa.Column("is_active", sa.Boolean(), default=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    # Students table
    op.create_table(
        "students",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("user_id", sa.Integer(), nullable=True, index=True),
        sa.Column("field_of_study", sa.String(), index=True),
        sa.Column("year_of_study", sa.String()),
        sa.Column("technical_skills", sa.JSON()),
        sa.Column("programming_languages", sa.JSON()),
        sa.Column("frameworks_and_tools", sa.JSON()),
        sa.Column("ai_ml_knowledge", sa.String()),
        sa.Column("previous_projects", sa.Text()),
        sa.Column("experience_level", sa.String()),
        sa.Column("areas_of_interest", sa.JSON()),
        sa.Column("preferred_project_domains", sa.JSON()),
        sa.Column("career_goals", sa.Text()),
        sa.Column("project_preferences", sa.Text()),
        sa.Column("available_time", sa.String()),
        sa.Column("team_size", sa.Integer()),
        sa.Column("available_resources", sa.Text()),
        sa.Column("preferred_project_complexity", sa.String()),
    )

    # Project ideas table
    op.create_table(
        "project_ideas",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("student_id", sa.Integer(), sa.ForeignKey("students.id")),
        sa.Column("name", sa.String(), index=True),
        sa.Column("problem", sa.Text()),
        sa.Column("solution", sa.Text()),
        sa.Column("target_users", sa.String()),
        sa.Column("difficulty_level", sa.String()),
        sa.Column("estimated_development_time", sa.String()),
        sa.Column("required_skills", sa.JSON()),
        sa.Column("skill_match_score", sa.Integer(), nullable=True),
        sa.Column("interest_match_score", sa.Integer(), nullable=True),
        sa.Column("feasibility_explanation", sa.Text(), nullable=True),
        sa.Column("is_selected", sa.Boolean(), default=False),
    )

    # Project blueprints table
    op.create_table(
        "project_blueprints",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("project_idea_id", sa.Integer(), sa.ForeignKey("project_ideas.id"), unique=True),
        sa.Column("overview", sa.JSON()),
        sa.Column("features", sa.JSON()),
        sa.Column("tech_stack", sa.JSON()),
        sa.Column("system_architecture", sa.JSON()),
        sa.Column("user_workflow", sa.JSON(), nullable=True),
        sa.Column("development_roadmap", sa.JSON()),
        sa.Column("challenges_and_solutions", sa.JSON()),
    )

    # Mentor messages table
    op.create_table(
        "mentor_messages",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("project_idea_id", sa.Integer(), sa.ForeignKey("project_ideas.id"), index=True),
        sa.Column("sender", sa.String()),
        sa.Column("message", sa.Text()),
        sa.Column("blueprint_updated", sa.Boolean(), default=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )


def downgrade() -> None:
    op.drop_table("mentor_messages")
    op.drop_table("project_blueprints")
    op.drop_table("project_ideas")
    op.drop_table("students")
    op.drop_table("users")
