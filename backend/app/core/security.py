import os
import hashlib
import hmac
from datetime import datetime, timedelta, timezone
from typing import Optional, Union, Dict, Any
import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from app.core.config import settings
from app.db.database import get_db

# Standard HTTP Bearer scheme
security_scheme = HTTPBearer(auto_error=False)

def get_password_hash(password: str) -> str:
    """
    Hash a password using PBKDF2-HMAC-SHA256 with 100,000 iterations and a random salt.
    Format: {salt_hex}${hash_hex}
    """
    salt = os.urandom(16).hex()
    key = hashlib.pbkdf2_hmac(
        "sha256",
        password.encode("utf-8"),
        bytes.fromhex(salt),
        100_000
    )
    return f"{salt}${key.hex()}"

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verify a plaintext password against a stored PBKDF2 hash using constant-time comparison.
    """
    try:
        parts = hashed_password.split("$")
        if len(parts) != 2:
            return False
        salt, expected_hash = parts[0], parts[1]
        key = hashlib.pbkdf2_hmac(
            "sha256",
            plain_password.encode("utf-8"),
            bytes.fromhex(salt),
            100_000
        )
        return hmac.compare_digest(key.hex(), expected_hash)
    except Exception:
        return False

def create_access_token(
    subject: Union[str, int],
    extra_claims: Optional[Dict[str, Any]] = None,
    expires_delta: Optional[timedelta] = None
) -> str:
    """
    Create a signed JWT access token with expiration time and payload claims.
    """
    now = datetime.now(timezone.utc)
    if expires_delta:
        expire = now + expires_delta
    else:
        expire = now + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    payload: Dict[str, Any] = {
        "sub": str(subject),
        "iat": int(now.timestamp()),
        "exp": int(expire.timestamp()),
    }
    if extra_claims:
        payload.update(extra_claims)
        
    encoded_jwt = jwt.encode(payload, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)
    return encoded_jwt

def decode_access_token(token: str) -> Optional[Dict[str, Any]]:
    """
    Decode and validate a JWT access token. Returns payload or None if invalid/expired.
    """
    try:
        payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
        return payload
    except (jwt.PyJWTError, Exception):
        return None

def get_current_user(
    auth: Optional[HTTPAuthorizationCredentials] = Depends(security_scheme),
    db: Session = Depends(get_db)
):
    """
    FastAPI dependency requiring a valid JWT Bearer token and returning the current User.
    """
    from app.models.user import User
    
    if not auth or not auth.credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication credentials were not provided",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    payload = decode_access_token(auth.credentials)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired authentication token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Malformed token credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    user = db.query(User).filter(User.id == int(user_id)).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Inactive user account"
        )
        
    return user

def get_optional_user(
    auth: Optional[HTTPAuthorizationCredentials] = Depends(security_scheme),
    db: Session = Depends(get_db)
):
    """
    FastAPI dependency that returns the User if authenticated, or None if guest/unauthenticated.
    """
    from app.models.user import User
    
    if not auth or not auth.credentials:
        return None
        
    payload = decode_access_token(auth.credentials)
    if not payload:
        return None
        
    user_id = payload.get("sub")
    if not user_id:
        return None
        
    user = db.query(User).filter(User.id == int(user_id)).first()
    return user if user and user.is_active else None
