# app/crud/users.py
from fastapi import HTTPException
from app.database import users_ref
from app.models import UserIn, UserDB
from app.utils import hash_password

async def create_user(user_in: UserIn) -> UserDB:
    """Creates a new user document in Firestore."""
    
    # 1. Check if user already exists
    existing_user = users_ref.where("email", "==", user_in.email).limit(1).get()
    if existing_user:
        raise HTTPException(status_code=400, detail="User with this email already exists.")
    
    # 2. Hash the password
    hashed_pwd = hash_password(user_in.password)
    
    # 3. Prepare data for Firestore
    user_data = {
        "email": user_in.email,
        "hashed_password": hashed_pwd, # Stored as bytes in Firestore
    }
    
    # 4. Add the document and get the document reference
    # .add() automatically generates the document ID
    _, doc_ref = users_ref.add(user_data)
    
    # 5. Return the created user object
    return UserDB(
        id=doc_ref.id, 
        email=user_in.email, 
        hashed_password=hashed_pwd
    )

async def get_user_by_email(email: str) -> UserDB | None:
    """Retrieves a user document by email."""
    # Firestore query
    docs = users_ref.where("email", "==", email).limit(1).get()
    
    if docs:
        doc = docs[0]
        data = doc.to_dict()
        return UserDB(
            id=doc.id,
            email=data["email"],
            hashed_password=data["hashed_password"] # Retrieved as bytes
        )
    return None