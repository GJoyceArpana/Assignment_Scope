# app/routers/auth.py
from fastapi import APIRouter, HTTPException, Depends
from app.models import UserIn, UserDB
from app.crud.users import create_user, get_user_by_email
from app.utils import verify_password, create_access_token
from datetime import timedelta

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register")
async def register(user_in: UserIn):
    """Endpoint for creating a new user."""
    try:
        # The create_user function handles hashing and existence check
        new_user = await create_user(user_in)
        # We don't return the password hash
        return {"message": "User registered successfully", "user_id": new_user.id}
    except HTTPException as e:
        # Re-raise the exception from the CRUD function
        raise e

@router.post("/login")
async def login(user_in: UserIn):
    """Endpoint for logging in and issuing a JWT."""
    # 1. Get user by email
    user_db = await get_user_by_email(user_in.email)
    
    if not user_db:
        raise HTTPException(status_code=401, detail="Incorrect email or password")
        
    # 2. Verify password
    if not verify_password(user_in.password, user_db.hashed_password):
        raise HTTPException(status_code=401, detail="Incorrect email or password")
        
    # 3. Create the JWT (Access Token)
    access_token_expires = timedelta(minutes=30)
    access_token = create_access_token(
        data={"sub": user_db.id}, # 'sub' stands for subject (the user ID)
        expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token, 
        "token_type": "bearer",
        "user_id": user_db.id
    }