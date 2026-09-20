import json
import time
import boto3
from botocore.exceptions import ClientError, NoCredentialsError
from app.core.config import settings
from app.core.activity_logger import log_activity

def get_s3_client():
    """Create boto3 S3 client using existing AWS credentials from settings."""
    try:
        kwargs = {"region_name": settings.S3_REGION or settings.AWS_REGION}
        if settings.AWS_ACCESS_KEY_ID and settings.AWS_SECRET_ACCESS_KEY:
            kwargs["aws_access_key_id"] = settings.AWS_ACCESS_KEY_ID
            kwargs["aws_secret_access_key"] = settings.AWS_SECRET_ACCESS_KEY
        return boto3.client("s3", **kwargs)
    except Exception as e:
        log_activity(agent="S3 Service [Init]", success=False, error=str(e), warning_reason="S3 client initialization failed")
        return None

def upload_blueprint_artifact(student_id: int, blueprint_dict: dict) -> dict:
    """Serialize blueprint to JSON and upload to S3. Returns {key, url, size}."""
    client = get_s3_client()
    if not client:
        raise ValueError("S3 client not available. Check AWS credentials.")
    
    timestamp = int(time.time())
    key = f"blueprints/{student_id}/blueprint-{timestamp}.json"
    body = json.dumps(blueprint_dict, indent=2, default=str)
    
    try:
        client.put_object(
            Bucket=settings.S3_BUCKET_NAME,
            Key=key,
            Body=body.encode("utf-8"),
            ContentType="application/json",
            Metadata={"student_id": str(student_id), "artifact_type": "blueprint"}
        )
        
        presigned_url = client.generate_presigned_url(
            "get_object",
            Params={"Bucket": settings.S3_BUCKET_NAME, "Key": key},
            ExpiresIn=3600  # 1 hour
        )
        
        log_activity(agent="S3 Service [Upload Blueprint]", success=True, error=None, warning_reason=None)
        return {"key": key, "url": presigned_url, "size_bytes": len(body)}
    except ClientError as e:
        log_activity(agent="S3 Service [Upload Blueprint]", success=False, error=str(e), warning_reason="S3 upload failed")
        raise

def upload_codebase_zip(student_id: int, zip_bytes: bytes, project_name: str = "project") -> dict:
    """Upload generated codebase ZIP to S3. Returns {key, url, size}."""
    client = get_s3_client()
    if not client:
        raise ValueError("S3 client not available. Check AWS credentials.")
    
    timestamp = int(time.time())
    slug = project_name.lower().replace(" ", "-")[:50]
    key = f"codebases/{student_id}/{slug}-{timestamp}.zip"
    
    try:
        client.put_object(
            Bucket=settings.S3_BUCKET_NAME,
            Key=key,
            Body=zip_bytes,
            ContentType="application/zip",
            Metadata={"student_id": str(student_id), "artifact_type": "codebase", "project_name": project_name}
        )
        
        presigned_url = client.generate_presigned_url(
            "get_object",
            Params={"Bucket": settings.S3_BUCKET_NAME, "Key": key},
            ExpiresIn=3600
        )
        
        log_activity(agent="S3 Service [Upload Codebase]", success=True, error=None, warning_reason=None)
        return {"key": key, "url": presigned_url, "size_bytes": len(zip_bytes)}
    except ClientError as e:
        log_activity(agent="S3 Service [Upload Codebase]", success=False, error=str(e), warning_reason="S3 codebase upload failed")
        raise

def list_student_artifacts(student_id: int) -> list:
    """List all S3 artifacts for a given student. Returns list of {key, size, last_modified, url}."""
    client = get_s3_client()
    if not client:
        return []
    
    artifacts = []
    try:
        for prefix in [f"blueprints/{student_id}/", f"codebases/{student_id}/"]:
            response = client.list_objects_v2(
                Bucket=settings.S3_BUCKET_NAME,
                Prefix=prefix
            )
            for obj in response.get("Contents", []):
                presigned_url = client.generate_presigned_url(
                    "get_object",
                    Params={"Bucket": settings.S3_BUCKET_NAME, "Key": obj["Key"]},
                    ExpiresIn=3600
                )
                artifacts.append({
                    "key": obj["Key"],
                    "size_bytes": obj["Size"],
                    "last_modified": obj["LastModified"].isoformat(),
                    "url": presigned_url,
                    "type": "blueprint" if "blueprints/" in obj["Key"] else "codebase"
                })
        
        log_activity(agent="S3 Service [List Artifacts]", success=True, error=None, warning_reason=None)
    except ClientError as e:
        log_activity(agent="S3 Service [List Artifacts]", success=False, error=str(e), warning_reason="S3 listing failed")
    
    return artifacts

def generate_presigned_url(key: str, expires_in: int = 3600) -> str:
    """Generate a fresh presigned download URL for any artifact key."""
    client = get_s3_client()
    if not client:
        raise ValueError("S3 client not available.")
    
    return client.generate_presigned_url(
        "get_object",
        Params={"Bucket": settings.S3_BUCKET_NAME, "Key": key},
        ExpiresIn=expires_in
    )
