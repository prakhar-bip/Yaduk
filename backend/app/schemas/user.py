from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field

class UserRegisterRequest(BaseModel):
    email: str = Field(..., description="Student's email address")
    password: str = Field(..., min_length=6, description="Password (at least 6 characters)")
    full_name: Optional[str] = Field(None, description="Student's full name")

class UserLoginRequest(BaseModel):
    email: str = Field(..., description="Student's email address")
    password: str = Field(..., description="Password")

class UserResponse(BaseModel):
    id: int
    email: str
    full_name: Optional[str] = None
    is_active: bool = True
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class AuthTokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse
