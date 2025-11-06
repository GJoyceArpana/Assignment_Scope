# app/routers/notes.py
from fastapi import APIRouter, Depends, HTTPException, status
from app.models import NoteIn, NoteDB
from app.deps import get_current_user_id
from app.crud import notes as notes_crud # Alias for clarity

router = APIRouter(prefix="/notes", tags=["Notes"])

# ---------------------------------
# 1. CREATE Note (POST /notes)
# ---------------------------------
@router.post("", response_model=NoteDB, status_code=status.HTTP_201_CREATED)
async def create_user_note(
    note_in: NoteIn, 
    user_id: str = Depends(get_current_user_id) # Protected by JWT
):
    """Creates a new note for the authenticated user."""
    return await notes_crud.create_note(user_id=user_id, note_in=note_in)

# ---------------------------------
# 2. READ All Notes (GET /notes)
# ---------------------------------
@router.get("", response_model=list[NoteDB])
async def read_user_notes(user_id: str = Depends(get_current_user_id)):
    """Retrieves all notes belonging to the authenticated user."""
    return await notes_crud.get_notes_by_user(user_id=user_id)

# ---------------------------------
# 3. READ Single Note (GET /notes/{note_id})
# ---------------------------------
@router.get("/{note_id}", response_model=NoteDB)
async def read_single_note(
    note_id: str, 
    user_id: str = Depends(get_current_user_id)
):
    """Retrieves a specific note, verifying ownership."""
    note = await notes_crud.get_note_by_id(note_id=note_id, user_id=user_id)
    if not note:
        # Don't reveal if the note exists but belongs to another user
        raise HTTPException(status_code=404, detail="Note not found")
    return note

# ---------------------------------
# 4. UPDATE Note (PUT /notes/{note_id})
# ---------------------------------
@router.put("/{note_id}", response_model=NoteDB)
async def update_user_note(
    note_id: str,
    note_in: NoteIn,
    user_id: str = Depends(get_current_user_id)
):
    """Updates a specific note, verifying ownership."""
    updated_note = await notes_crud.update_note(note_id=note_id, user_id=user_id, note_in=note_in)
    if not updated_note:
        raise HTTPException(status_code=404, detail="Note not found or you don't own it")
    return updated_note

# ---------------------------------
# 5. DELETE Note (DELETE /notes/{note_id})
# ---------------------------------
@router.delete("/{note_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user_note(
    note_id: str,
    user_id: str = Depends(get_current_user_id)
):
    """Deletes a specific note, verifying ownership."""
    success = await notes_crud.delete_note(note_id=note_id, user_id=user_id)
    if not success:
        raise HTTPException(status_code=404, detail="Note not found or you don't own it")
    # Return 204 No Content on successful deletion
    return