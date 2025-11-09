# app/utils.py
from datetime import datetime, timedelta
from typing import Optional
from jose import jwt, JWTError
from passlib.context import CryptContext
from fastapi import status, HTTPException

# Passlib context configuration (using bcrypt for hashing)
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# JWT Configuration 
# IMPORTANT: This key MUST be kept secret and should ideally be loaded from an environment variable.
SECRET_KEY = "8olHiUtHq-Mude3eLJcQqiAsSWoL2GiAvn3_YRA_jaQ" 
ALGORITHM = "HS256"

# --- Password Hashing Functions ---

def hash_password(password: str) -> str:
    """Hashes a plain text password."""
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifies a plain text password against a stored hash."""
    return pwd_context.verify(plain_password, hashed_password)

# --- JWT Functions (Creation) ---

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """Creates a JSON Web Token (JWT) for authentication."""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        # Default expiration of 15 minutes
        expire = datetime.utcnow() + timedelta(minutes=15)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

# --- JWT Functions (Decoding/Validation) ---

def decode_access_token(token: str):
    """
    Decodes and validates a JWT access token. 
    This function resolves the ImportError you were experiencing.
    """
    try:
        # 1. Decode the JWT and validate signature/expiration
        payload = jwt.decode(
            token, 
            SECRET_KEY, 
            algorithms=[ALGORITHM]
        )
        # 2. Extract the subject (which should be the user ID)
        user_id: str = payload.get("sub")
        if user_id is None:
            # If the token is valid but doesn't have a 'sub' claim
            raise JWTError()
        return user_id
    
    except JWTError:
        # 3. Raise 401 Unauthorized for any validation failure
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )