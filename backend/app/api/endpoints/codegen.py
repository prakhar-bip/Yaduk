"""
Yaduk CodeGen API — Per-file code generation endpoint.

This endpoint generates ONE source code file at a time with full context injection,
enabling the LLM to produce complete, production-quality code instead of stubs.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from app.services.codegen_service import generate_single_file
from app.core.activity_logger import log_activity

router = APIRouter()


class GenerateFileRequest(BaseModel):
    """Request body for single-file code generation."""
    file_path: str
    file_purpose: str
    project_title: str
    blueprint_summary: Optional[str] = ""
    db_schema_ddl: Optional[str] = ""
    api_routes: Optional[List[Dict[str, Any]]] = None
    theme: Optional[Dict[str, str]] = None
    approved_dependencies: Optional[List[Dict[str, str]]] = None
    existing_files: Optional[Dict[str, str]] = None
    mvp_features: Optional[List[Any]] = None
    screen_context: Optional[Dict[str, Any]] = None


class GenerateFileResponse(BaseModel):
    """Response body with generated code."""
    file_path: str
    code: str
    language: str
    success: bool


def _detect_language(file_path: str) -> str:
    """Detect programming language from file extension."""
    ext = file_path.rsplit(".", 1)[-1].lower() if "." in file_path else "text"
    lang_map = {
        "py": "python",
        "ts": "typescript",
        "tsx": "typescript",
        "js": "javascript",
        "jsx": "javascript",
        "sql": "sql",
        "json": "json",
        "css": "css",
        "html": "html",
        "yml": "yaml",
        "yaml": "yaml",
        "md": "markdown",
        "sh": "bash",
        "bash": "bash",
        "env": "bash",
        "go": "go",
        "java": "java",
        "rs": "rust",
    }
    return lang_map.get(ext, "text")


@router.post("/generate-file", response_model=GenerateFileResponse)
def codegen_generate_file(req: GenerateFileRequest):
    """
    Generate a single source code file with full context injection.

    This endpoint gives the LLM the complete project knowledge base
    (theme, DB schema, API routes, already-generated files) focused
    on producing ONE complete file — resulting in dense, production-quality code.
    """
    try:
        code = generate_single_file(
            file_path=req.file_path,
            file_purpose=req.file_purpose,
            project_title=req.project_title,
            blueprint_summary=req.blueprint_summary,
            db_schema_ddl=req.db_schema_ddl,
            api_routes=req.api_routes,
            theme=req.theme,
            approved_dependencies=req.approved_dependencies,
            existing_files=req.existing_files,
            mvp_features=req.mvp_features,
            screen_context=req.screen_context,
        )

        language = _detect_language(req.file_path)

        log_activity(
            agent=f"CodeGen API [{req.file_path}]",
            success=True,
            error=None,
            warning_reason=None
        )

        return GenerateFileResponse(
            file_path=req.file_path,
            code=code,
            language=language,
            success=True,
        )

    except Exception as e:
        log_activity(
            agent=f"CodeGen API [{req.file_path}]",
            success=False,
            error=str(e),
            warning_reason=f"Code generation failed for {req.file_path}"
        )
        raise HTTPException(
            status_code=500,
            detail=f"Code generation failed for {req.file_path}: {str(e)}"
        )
