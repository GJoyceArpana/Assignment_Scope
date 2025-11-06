# app/database.py

import firebase_admin
from firebase_admin import credentials, firestore

# Replace with the path to your downloaded key file
SERVICE_ACCOUNT_KEY_PATH = "serviceAccountKey.json" 

def initialize_firebase():
    """Initializes the Firebase Admin SDK."""
    try:
        # Check if the app is already initialized
        if not firebase_admin._apps:
            cred = credentials.Certificate(SERVICE_ACCOUNT_KEY_PATH)
            firebase_admin.initialize_app(cred)
            print("Firebase Admin SDK initialized successfully.")
    except Exception as e:
        print(f"Error initializing Firebase: {e}")

# Call the initialization function
initialize_firebase()

# Export the Firestore client for use across the application
db = firestore.client()

# Collection references
users_ref = db.collection("users")
notes_ref = db.collection("notes")