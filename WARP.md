# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

Full-stack notes application with FastAPI backend and React frontend. Users can register, authenticate, and perform CRUD operations on personal notes stored in Firebase Firestore.

## Commands

### Backend (FastAPI - notes_app/)

**Setup & Run:**
```bash
# Navigate to backend directory
cd notes_app

# Install dependencies
pip install -r requirements.txt

# Run development server (from notes_app/ directory)
uvicorn app.main:app --reload

# Run on specific host/port
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Important:** Backend requires `serviceAccountKey.json` in the `notes_app/` directory for Firebase authentication.

### Frontend (React - notes-app-frontend/)

**Setup & Run:**
```bash
# Navigate to frontend directory
cd notes-app-frontend

# Install dependencies
npm install

# Run development server (localhost:3000)
npm start

# Build for production
npm run build

# Run tests
npm test
```

## Architecture

### Backend Structure

The backend follows a clean layered architecture:

- **`app/main.py`**: FastAPI application entry point, CORS configuration, router registration
- **`app/database.py`**: Firebase Admin SDK initialization, Firestore client management
  - Exposes `get_db()`, `get_users_ref()`, `get_notes_ref()` for safe access to Firestore collections
- **`app/models.py`**: Pydantic schemas for validation and serialization (UserIn, UserDB, NoteIn, NoteDB)
- **`app/routers/`**: API endpoint definitions
  - `auth.py`: `/auth/register` and `/auth/login` endpoints
  - `notes.py`: CRUD endpoints at `/notes` (all protected by JWT)
- **`app/crud/`**: Database operations
  - `users.py`: User creation and retrieval from Firestore
  - `notes.py`: Note CRUD operations with ownership verification
- **`app/utils.py`**: Utility functions for password hashing (bcrypt) and JWT creation/verification
- **`app/deps.py`**: FastAPI dependencies, primarily `get_current_user_id()` for JWT authentication

### Authentication Flow

1. User registers (`POST /auth/register`) → password hashed with bcrypt, user stored in Firestore
2. User logs in (`POST /auth/login`) → credentials verified, JWT token issued (30min expiration)
3. Protected endpoints require `Authorization: Bearer <token>` header
4. `get_current_user_id()` dependency extracts and validates JWT, returns user_id for authorization checks

### Frontend Structure

React app using Create React App:

- **`src/App.js`**: Main routing, implements `PrivateRoute` component for protected routes
- **`src/context/AuthContext.js`**: Authentication state management (token, userId) with localStorage persistence
- **`src/components/`**:
  - `Register.js` / `Login.js`: Authentication forms
  - `Dashboard.js`: Main app interface, handles note CRUD operations via axios
  - `Navigation.js`: Route navigation
- **API Communication**: All requests to `http://localhost:8000` with JWT in Authorization header

### Data Models

**User**: `{ id, email, hashed_password }`
**Note**: `{ id, user_id, title, content, created_at, updated_at }`

### Security Considerations

- All note operations verify ownership by checking `user_id` matches authenticated user
- JWT secret is hardcoded in `app/utils.py` (should be environment variable in production)
- Notes CRUD operations in `app/crud/notes.py` implement ownership checks to prevent unauthorized access
- Password hashing handled by bcrypt via `app/utils.py`

## Key Dependencies

**Backend:**
- FastAPI + Uvicorn (ASGI server)
- firebase-admin (Firestore database)
- python-jose (JWT handling)
- passlib + bcrypt (password hashing)

**Frontend:**
- React 19
- react-router-dom (routing)
- axios (HTTP client)
- @testing-library (testing utilities)

## Development Notes

- Backend and frontend run on separate ports (8000 and 3000) with CORS enabled
- Frontend stores JWT and userId in localStorage for session persistence
- Firestore collections: `users` and `notes`
- All backend CRUD functions are async but Firestore operations are synchronous
- Note: `app/crud/notes.py` line 2 imports `notes_ref` directly (outdated pattern) but should use `get_notes_ref()` from database.py
