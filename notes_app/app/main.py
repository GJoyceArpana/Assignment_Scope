# app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import initialize_firebase # To ensure initialization
from app.routers import auth,notes # We will create notes router next

# Ensure Firebase is initialized when the app starts
initialize_firebase()

app = FastAPI(title="Full-Stack Notes App API")

# Setup CORS (Cross-Origin Resource Sharing)
# This is crucial so your React/Frontend app can talk to the Backend
origins = [
    "http://localhost:3000",  # Replace with your Frontend URL when known
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Include Routers ---
app.include_router(auth.router)
app.include_router(notes.router) # Will be uncommented after we create it

@app.get("/")
def read_root():
    return {"message": "Welcome to the Full-Stack Notes App API"}