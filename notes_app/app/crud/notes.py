# app/crud/notes.py
from app.database import notes_ref
from app.models import NoteIn, NoteDB
from datetime import datetime
from google.cloud.firestore import Query

# --- Helper Function ---
def _doc_to_note(doc) -> NoteDB:
    """Converts a Firestore document snapshot to a Pydantic NoteDB model."""
    data = doc.to_dict()
    return NoteDB(
        id=doc.id,
        user_id=data["user_id"],
        title=data["title"],
        content=data["content"],
        created_at=data["created_at"],
        updated_at=data["updated_at"],
    )

# --- CRUD Functions ---

async def create_note(user_id: str, note_in: NoteIn) -> NoteDB:
    """Creates a new note for the specified user."""
    timestamp = datetime.now()
    note_data = {
        "user_id": user_id,
        "title": note_in.title,
        "content": note_in.content,
        "created_at": timestamp,
        "updated_at": timestamp,
    }
    # .add() automatically generates the document ID
    _, doc_ref = notes_ref.add(note_data)
    
    return NoteDB(id=doc_ref.id, **note_data)

async def get_notes_by_user(user_id: str) -> list[NoteDB]:
    """Retrieves all notes belonging to a specific user."""
    # Filter notes by user_id
    notes_docs = notes_ref.where("user_id", "==", user_id).order_by("updated_at", direction=Query.DESCENDING).get()
    
    notes = [_doc_to_note(doc) for doc in notes_docs]
    return notes

async def get_note_by_id(note_id: str, user_id: str) -> NoteDB | None:
    """Retrieves a single note by ID, verifying ownership."""
    doc = notes_ref.document(note_id).get()
    
    if not doc.exists:
        return None
        
    note_db = _doc_to_note(doc)
    
    # Crucial Security Check: Ensure the note belongs to the user
    if note_db.user_id != user_id:
        return None # Return None as if it doesn't exist for this user
        
    return note_db

async def update_note(note_id: str, user_id: str, note_in: NoteIn) -> NoteDB | None:
    """Updates an existing note, verifying ownership."""
    note_doc_ref = notes_ref.document(note_id)
    doc = note_doc_ref.get()
    
    if not doc.exists or doc.to_dict().get("user_id") != user_id:
        return None

    update_data = {
        "title": note_in.title,
        "content": note_in.content,
        "updated_at": datetime.now(),
    }
    
    note_doc_ref.update(update_data)
    
    # Retrieve the updated document to return the complete model
    updated_doc = note_doc_ref.get()
    return _doc_to_note(updated_doc)

async def delete_note(note_id: str, user_id: str) -> bool:
    """Deletes a note, verifying ownership."""
    note_doc_ref = notes_ref.document(note_id)
    doc = note_doc_ref.get()
    
    if not doc.exists or doc.to_dict().get("user_id") != user_id:
        return False # Deletion failed (note not found or not owned)

    note_doc_ref.delete()
    return True