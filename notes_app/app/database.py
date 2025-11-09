# app/database.py

import firebase_admin
from firebase_admin import credentials, firestore
from firebase_admin import _apps

# IMPORTANT: Replace with the actual path to your downloaded key file
SERVICE_ACCOUNT_KEY_PATH = "serviceAccountKey.json" 

# Global variable for the database client
db = None

def initialize_firebase():
    """Initializes the Firebase Admin SDK and sets the global db client."""
    global db # Allows modifying the global 'db' variable
    try:
        # Check if the app is already initialized
        if not _apps:
            cred = credentials.Certificate(SERVICE_ACCOUNT_KEY_PATH)
            firebase_admin.initialize_app(cred)
            print("Firebase Admin SDK initialized successfully.")
        
        # Initialize the client AFTER successful app initialization
        if db is None:
            db = firestore.client()
            
    except Exception as e:
        # If the file is missing or credentials are bad, this is where it fails.
        print(f"FATAL Error initializing Firebase: {e}")
        # In a real app, you might re-raise or handle this gracefully.

# Call the initialization function
initialize_firebase()

# --- Functions to retrieve references safely ---
# These functions replace the global variables (users_ref, notes_ref) 
# and ensure they use the initialized 'db' client.

def get_db():
    """Returns the Firestore client."""
    return db

def get_users_ref():
    """Returns the users collection reference."""
    if db:
        return db.collection("users")
    raise Exception("Firestore client is not initialized.")

def get_notes_ref():
    """Returns the notes collection reference."""
    if db:
        return db.collection("notes")
    raise Exception("Firestore client is not initialized.")

# NOTE: You will need to update app/crud/users.py to use get_users_ref()