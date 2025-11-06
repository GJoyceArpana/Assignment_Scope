# app/deps.py
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from app.utils import decode_access_token

# OAuth2PasswordBearer is standard for fetching the token from the "Authorization: Bearer <token>" header
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

async def get_current_user_id(token: str = Depends(oauth2_scheme)) -> str:
    """
    A FastAPI Dependency function that verifies the JWT token
    and returns the authenticated user's ID.
    """
    try:
        user_id = decode_access_token(token)
        return user_id
    except HTTPException as e:
        # Re-raise authentication errors to be handled by FastAPI
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=e.detail, # Will be "Token expired" or "Invalid token"
            headers={"WWW-Authenticate": "Bearer"},
        )