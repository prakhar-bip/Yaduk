import time
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.db.database import get_db
from app.core.config import settings

router = APIRouter()

@router.get("/")
@router.get("")
def check_health(db: Session = Depends(get_db)):
    """
    Comprehensive system health and live PostgreSQL database connectivity verification.
    """
    t0 = time.time()
    try:
        # Execute query to test database connectivity and measure latency
        db.execute(text("SELECT 1")).scalar()
        latency_ms = round((time.time() - t0) * 1000, 2)
        
        # Get count of registered records
        user_count = db.execute(text("SELECT count(*) FROM users")).scalar()
        student_count = db.execute(text("SELECT count(*) FROM students")).scalar()
        project_count = db.execute(text("SELECT count(*) FROM project_ideas")).scalar()
        
        db_status = {
            "connected": True,
            "latency_ms": latency_ms,
            "dialect": "postgresql",
            "active_tables": ["users", "students", "project_ideas", "project_blueprints", "mentor_messages"],
            "records": {
                "users": user_count,
                "students": student_count,
                "project_ideas": project_count,
            },
        }
    except Exception as e:
        latency_ms = round((time.time() - t0) * 1000, 2)
        db_status = {
            "connected": False,
            "latency_ms": latency_ms,
            "error": str(e)
        }
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail={"status": "degraded", "database": db_status}
        )

    return {
        "status": "healthy",
        "service": "Yaduk AI Backend",
        "environment": settings.ENVIRONMENT,
        "database": db_status,
        "timestamp": datetime.now(timezone.utc).isoformat()
    }
