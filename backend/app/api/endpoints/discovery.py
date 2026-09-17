from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.student import Student
from app.schemas.student import StudentCreate, StudentResponse
from app.core.activity_logger import log_activity

router = APIRouter()

@router.post("/", response_model=StudentResponse)
def create_student_profile(student_in: StudentCreate, db: Session = Depends(get_db)):
    """
    Step 1 & 2: Receive student discovery data and save the dynamic student profile to the database.
    """
    try:
        student_data = student_in.model_dump()
        db_student = Student(**student_data)
        db.add(db_student)
        db.commit()
        db.refresh(db_student)
        log_activity(
            agent="Student Profile Discovery Agent [Database]",
            success=True,
            error=None,
            warning_reason=None
        )
        return db_student
    except Exception as e:
        log_activity(
            agent="Student Profile Discovery Agent [Database]",
            success=False,
            error=f"{type(e).__name__}: {str(e)}",
            warning_reason="Reason: Failed to persist student profile in database"
        )
        raise HTTPException(status_code=500, detail=f"Failed to create student: {str(e)}")
