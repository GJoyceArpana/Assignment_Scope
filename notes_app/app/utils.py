# app/utils.py
from datetime import datetime, timedelta
from typing import Optional
import os
from dotenv import load_dotenv # ⬅️ ADDED
from jose import jwt, JWTError
from passlib.context import CryptContext
from fastapi import status, HTTPException

# Load environment variables from .env file (assuming it's in the project root)
# This is a good practice to ensure variables are available.
load_dotenv() # ⬅️ ADDED

# --- Configuration ---

# Passlib context configuration (using bcrypt for hashing)
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# JWT Configuration 
# ⚠️ IMPORTANT: Load the key from the environment variable 'JWT_SECRET_KEY'.
# The hardcoded key is now a fallback, but should be removed in production.
SECRET_KEY = os.getenv(
    "JWT_SECRET_KEY", 
    "8olHiUtHq-Mude3eLJcQqiAsSWoL2GiAvn3_YRA_jaQ"
) # ⬅️ UPDATED to load from OS environment
ALGORITHM = "HS256"

# --- Password Hashing Functions ---

def hash_password(password: str) -> str:
    """
    Hashes a plain text password.
    
    FIX: The password is truncated to 72 characters because the bcrypt 
    implementation in Passlib/Bcrypt only uses the first 72 bytes 
    and raises a ValueError if the input is longer.
    """
    safe_password = password[:72]
    return pwd_context.hash(safe_password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifies a plain text password against a stored hash."""
    # Ensure the plain password is also truncated to 72 characters before verification
    # for a consistent comparison against the hash created from the truncated password.
    safe_plain_password = plain_password[:72]
    return pwd_context.verify(safe_plain_password, hashed_password)

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