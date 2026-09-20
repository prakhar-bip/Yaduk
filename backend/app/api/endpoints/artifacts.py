from fastapi import APIRouter, HTTPException, UploadFile, File
from typing import List, Optional
from pydantic import BaseModel
from app.services.s3_service import (
    upload_blueprint_artifact,
    upload_codebase_zip,
    list_student_artifacts,
    generate_presigned_url,
)
from app.core.activity_logger import log_activity
from slowapi import Limiter
from slowapi.util import get_remote_address

router = APIRouter()
limiter = Limiter(key_func=get_remote_address)


class ArtifactResponse(BaseModel):
    key: str
    url: str
    size_bytes: int
    type: Optional[str] = None
    last_modified: Optional[str] = None


class BlueprintUploadRequest(BaseModel):
    student_id: int
    blueprint: dict


class PresignedUrlRequest(BaseModel):
    key: str
    expires_in: Optional[int] = 3600


@router.get("/{student_id}", response_model=List[ArtifactResponse])
def get_student_artifacts(student_id: int):
    """
    List all S3-stored artifacts (blueprints, codebases) for a student.
    """
    try:
        artifacts = list_student_artifacts(student_id)
        log_activity(
            agent="Artifacts API [List]",
            success=True,
            error=None,
            warning_reason=None
        )
        return artifacts
    except Exception as e:
        log_activity(
            agent="Artifacts API [List]",
            success=False,
            error=str(e),
            warning_reason="Failed to list student artifacts from S3"
        )
        raise HTTPException(status_code=500, detail=f"Failed to list artifacts: {str(e)}")


@router.post("/blueprint", response_model=ArtifactResponse)
def upload_blueprint(req: BlueprintUploadRequest):
    """
    Upload a project blueprint as a JSON artifact to Amazon S3.
    Returns a presigned download URL valid for 1 hour.
    """
    try:
        result = upload_blueprint_artifact(req.student_id, req.blueprint)
        result["type"] = "blueprint"
        log_activity(
            agent="Artifacts API [Upload Blueprint]",
            success=True,
            error=None,
            warning_reason=None
        )
        return result
    except Exception as e:
        log_activity(
            agent="Artifacts API [Upload Blueprint]",
            success=False,
            error=str(e),
            warning_reason="Blueprint S3 upload failed"
        )
        raise HTTPException(status_code=500, detail=f"Blueprint upload failed: {str(e)}")


@router.post("/{student_id}/upload-codebase", response_model=ArtifactResponse)
async def upload_codebase(student_id: int, file: UploadFile = File(...)):
    """
    Upload a generated codebase ZIP file to Amazon S3.
    Returns a presigned download URL valid for 1 hour.
    """
    if not file.filename or not file.filename.endswith(".zip"):
        raise HTTPException(status_code=400, detail="Only .zip files are accepted")
    
    try:
        zip_bytes = await file.read()
        if len(zip_bytes) > 50 * 1024 * 1024:  # 50MB limit
            raise HTTPException(status_code=413, detail="File too large. Maximum size is 50MB.")
        
        project_name = file.filename.replace(".zip", "")
        result = upload_codebase_zip(student_id, zip_bytes, project_name)
        result["type"] = "codebase"
        log_activity(
            agent="Artifacts API [Upload Codebase]",
            success=True,
            error=None,
            warning_reason=None
        )
        return result
    except HTTPException:
        raise
    except Exception as e:
        log_activity(
            agent="Artifacts API [Upload Codebase]",
            success=False,
            error=str(e),
            warning_reason="Codebase S3 upload failed"
        )
        raise HTTPException(status_code=500, detail=f"Codebase upload failed: {str(e)}")


@router.post("/download-url")
def get_download_url(req: PresignedUrlRequest):
    """
    Generate a fresh presigned download URL for any artifact stored in S3.
    """
    try:
        url = generate_presigned_url(req.key, req.expires_in or 3600)
        return {"url": url, "key": req.key, "expires_in": req.expires_in}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate download URL: {str(e)}")
