# app/models.py
from pydantic import BaseModel, EmailStr, ConfigDict
from datetime import datetime

# --- User Models ---

class UserIn(BaseModel):
    """Schema for incoming user registration data."""
    email: EmailStr
    password: str

class UserDB(BaseModel):
    """Schema for how user data is stored in the database."""
    id: str # The document ID in Firestore
    email: EmailStr
    hashed_password: str
    
# --- Note Models ---

class NoteIn(BaseModel):
    """Schema for creating or updating a note."""
    title: str
    content: str
    
class NoteDB(NoteIn):
    """Schema for how note data is stored in the database."""
    model_config = ConfigDict(json_encoders={datetime: lambda v: v.isoformat()})
    
    id: str
    user_id: str # Links the note to a specific user
    created_at: datetime
    updated_at: datetime
