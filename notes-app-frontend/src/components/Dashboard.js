// src/components/Dashboard.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const API_BASE_URL = 'http://localhost:8000';

const Dashboard = () => {
  const { token, logout } = useAuth();
  const [notes, setNotes] = useState([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [error, setError] = useState(null);
  const [editingNoteId, setEditingNoteId] = useState(null); // For edit functionality

  // Configuration for API requests requiring authorization
  const authConfig = {
    headers: { Authorization: `Bearer ${token}` }
  };

  // --- R (Read) - Fetch Notes ---
  const fetchNotes = async () => {
    setError(null);
    try {
      const response = await axios.get(`${API_BASE_URL}/notes`, authConfig);
      setNotes(response.data);
    } catch (err) {
      if (err.response && err.response.status === 401) {
        // If token is expired or invalid
        alert("Session expired. Please log in again.");
        logout();
      } else {
        setError("Failed to fetch notes.");
      }
    }
  };

  useEffect(() => {
    if (token) {
      fetchNotes();
    }
  }, [token]);

  // --- C (Create) / U (Update) - Handle Note Submission ---
  const handleNoteSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const noteData = { title, content };
    let request;
    
    try {
      if (editingNoteId) {
        // UPDATE operation
        request = axios.put(`${API_BASE_URL}/notes/${editingNoteId}`, noteData, authConfig);
      } else {
        // CREATE operation
        request = axios.post(`${API_BASE_URL}/notes`, noteData, authConfig);
      }

      await request;
      
      // Reset form and state
      setTitle('');
      setContent('');
      setEditingNoteId(null);
      fetchNotes(); // Refresh list

    } catch (err) {
      setError('Failed to save the note.');
    }
  };

  // --- U (Update) - Set up form for editing ---
  const startEdit = (note) => {
    setTitle(note.title);
    setContent(note.content);
    setEditingNoteId(note.id);
  };

  // --- D (Delete) - Delete Note ---
  const handleDelete = async (noteId) => {
    setError(null);
    try {
      await axios.delete(`${API_BASE_URL}/notes/${noteId}`, authConfig);
      fetchNotes(); // Refresh list
    } catch (err) {
      setError('Failed to delete note.');
    }
  };
  
  // --- Logout ---
  const handleLogout = () => {
    logout();
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>My Notes Dashboard</h2>
        <button onClick={handleLogout} className="btn btn-danger">Log Out</button>
      </div>

      {error && <div className="alert alert-warning">{error}</div>}

      {/* Note Creation/Editing Form */}
      <div className="card mb-5 p-4">
        <h5>{editingNoteId ? 'Edit Note' : 'Create New Note'}</h5>
        <form onSubmit={handleNoteSubmit}>
          <div className="mb-3">
            <input 
              type="text" 
              className="form-control" 
              placeholder="Title"
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              required 
            />
          </div>
          <div className="mb-3">
            <textarea 
              className="form-control" 
              rows="3" 
              placeholder="Content..."
              value={content} 
              onChange={(e) => setContent(e.target.value)} 
              required
            ></textarea>
          </div>
          <button type="submit" className="btn btn-primary me-2">
            {editingNoteId ? 'Save Changes' : 'Add Note'}
          </button>
          {editingNoteId && (
            <button 
              type="button" 
              className="btn btn-secondary" 
              onClick={() => {
                setEditingNoteId(null);
                setTitle('');
                setContent('');
              }}
            >
              Cancel
            </button>
          )}
        </form>
      </div>

      {/* Notes List */}
      <div className="row">
        {notes.length === 0 ? (
          <p>You have no notes. Create one above!</p>
        ) : (
          notes.map(note => (
            <div key={note.id} className="col-md-4 mb-4">
              <div className="card h-100">
                <div className="card-body">
                  <h5 className="card-title">{note.title}</h5>
                  <p className="card-text">{note.content}</p>
                </div>
                <div className="card-footer d-flex justify-content-between">
                  <button 
                    className="btn btn-sm btn-info"
                    onClick={() => startEdit(note)}
                  >
                    Edit
                  </button>
                  <button 
                    className="btn btn-sm btn-danger"
                    onClick={() => handleDelete(note.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Dashboard;