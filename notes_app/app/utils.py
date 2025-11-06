# app/utils.py
import jwt
import bcrypt
import os
from dotenv import load_dotenv # Import load_dotenv
from datetime import datetime, timedelta, timezone
from fastapi import HTTPException
from fastapi import status # Added for cleaner HTTP status codes

# --- Load Environment Variables ---
# This looks for a .env file and loads its contents into the environment
load_dotenv() 

# --- JWT Configuration ---
# 1. Retrieve the secret key from the environment variables
SECRET_KEY = os.getenv("JWT_SECRET_KEY") 
ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256") # Use a default if not set
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("JWT_EXPIRE_MINUTES", 30))

# 2. Critical Check: Ensure the secret key is loaded
if SECRET_KEY is None or SECRET_KEY == "your-new-long-random-secret-key-for-jwt-signing":
    raise EnvironmentError(
        "JWT_SECRET_KEY not set or is using the default placeholder in the .env file. "
        "Please generate a secure, random key and update .env"
    )

# --- Password Utility Functions ---

def hash_password(password: str) -> bytes:
    """Hashes a password using bcrypt."""
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())

def verify_password(password: str, hashed_password: bytes) -> bool:
    """Verifies a password against a stored hash."""
    return bcrypt.checkpw(password.encode('utf-8'), hashed_password)

# --- JWT Utility Functions ---

def create_access_token(data: dict, expires_delta: timedelta | None = None):
    """Creates a signed JSON Web Token (JWT)."""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire, "iat": datetime.now(timezone.utc)})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def decode_access_token(token: str) -> str:
    """Decodes a JWT and returns the user ID (sub)."""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            # Handle token structure error
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED, 
                detail="Invalid token payload structure"
            )
        return user_id
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, 
            detail="Token expired"
        )
    except jwt.InvalidTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, 
            detail="Invalid token"
        )