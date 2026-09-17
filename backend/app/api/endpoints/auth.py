from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.user import User
from app.schemas.user import (
    UserRegisterRequest,
    UserLoginRequest,
    UserResponse,
    AuthTokenResponse,
)
from app.core.security import (
    get_password_hash,
    verify_password,
    create_access_token,
    get_current_user,
)
from app.core.activity_logger import log_activity

router = APIRouter()

@router.post("/register", response_model=AuthTokenResponse, status_code=status.HTTP_201_CREATED)
def register_user(req: UserRegisterRequest, db: Session = Depends(get_db)):
    """
    Register a new student account, store securely, and return an authentication token.
    """
    clean_email = req.email.strip().lower()
    
    # Check duplicate email
    existing_user = db.query(User).filter(User.email == clean_email).first()
    if existing_user:
        log_activity(
            agent="Auth Agent [Register]",
            success=False,
            error="Duplicate email",
            warning_reason=f"Reason: Email {clean_email} is already registered"
        )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email already exists"
        )

    try:
        hashed_pw = get_password_hash(req.password)
        new_user = User(
            email=clean_email,
            hashed_password=hashed_pw,
            full_name=req.full_name.strip() if req.full_name else None,
            is_active=True,
        )
        db.add(new_user)
        db.commit()
        db.refresh(new_user)

        token = create_access_token(
            subject=new_user.id,
            extra_claims={"email": new_user.email, "name": new_user.full_name or ""}
        )

        log_activity(
            agent="Auth Agent [Register]",
            success=True,
            error=None,
            warning_reason=None
        )

        return AuthTokenResponse(
            access_token=token,
            token_type="bearer",
            user=UserResponse.model_validate(new_user)
        )
    except Exception as exc:
        db.rollback()
        log_activity(
            agent="Auth Agent [Register]",
            success=False,
            error=f"{type(exc).__name__}: {str(exc)}",
            warning_reason="Reason: Failed to create user in database"
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Registration failed: {str(exc)}"
        )

@router.post("/login", response_model=AuthTokenResponse)
def login_user(req: UserLoginRequest, db: Session = Depends(get_db)):
    """
    Authenticate a user with email and password, returning a JWT token on success.
    """
    clean_email = req.email.strip().lower()
    user = db.query(User).filter(User.email == clean_email).first()

    if not user or not verify_password(req.password, user.hashed_password):
        log_activity(
            agent="Auth Agent [Login]",
            success=False,
            error="Invalid credentials",
            warning_reason=f"Reason: Failed login attempt for email {clean_email}"
        )
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.is_active:
        log_activity(
            agent="Auth Agent [Login]",
            success=False,
            error="Inactive account",
            warning_reason=f"Reason: Inactive account login attempted for {clean_email}"
        )
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is deactivated"
        )

    token = create_access_token(
        subject=user.id,
        extra_claims={"email": user.email, "name": user.full_name or ""}
    )

    log_activity(
        agent="Auth Agent [Login]",
        success=True,
        error=None,
        warning_reason=None
    )

    return AuthTokenResponse(
        access_token=token,
        token_type="bearer",
        user=UserResponse.model_validate(user)
    )

@router.get("/me", response_model=UserResponse)
def get_authenticated_user(current_user: User = Depends(get_current_user)):
    """
    Fetch the currently authenticated user profile based on Bearer token.
    """
    return UserResponse.model_validate(current_user)

@router.post("/logout")
def logout_user():
    """
    Sign out user (client invalidates token).
    """
    return {"message": "Successfully signed out"}
