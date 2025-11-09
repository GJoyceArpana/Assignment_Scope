// src/components/Dashboard.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import './Dashboard.css';

const API_BASE_URL = 'http://localhost:8000';

const Dashboard = () => {
  const { token, logout, userId } = useAuth();
  const [notes, setNotes] = useState([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [error, setError] = useState(null);
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [showModal, setShowModal] = useState(false);

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
      setShowModal(false);
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
    setShowModal(true);
  };

  const openNewNoteModal = () => {
    setTitle('');
    setContent('');
    setEditingNoteId(null);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setTitle('');
    setContent('');
    setEditingNoteId(null);
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

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', { 
      month: 'numeric', 
      day: 'numeric', 
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <div className="dashboard-container">
      {/* Header */}
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">HOME WORK</h1>
          <p className="dashboard-subtitle">Welcome, {userId ? userId.substring(0, 8) : 'User'}</p>
        </div>
        <button onClick={handleLogout} className="logout-button">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M6 14H3.33333C2.97971 14 2.64057 13.8595 2.39052 13.6095C2.14048 13.3594 2 13.0203 2 12.6667V3.33333C2 2.97971 2.14048 2.64057 2.39052 2.39052C2.64057 2.14048 2.97971 2 3.33333 2H6M10.6667 11.3333L14 8M14 8L10.6667 4.66667M14 8H6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Logout
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {/* Notes Section */}
      <div className="notes-section">
        <div className="notes-header">
          <div>
            <h2 className="notes-title">My Notes</h2>
            <p className="notes-count">{notes.length} {notes.length === 1 ? 'note' : 'notes'}</p>
          </div>
          <button onClick={openNewNoteModal} className="new-note-button">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M8 3.33333V12.6667M3.33333 8H12.6667" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            New Note
          </button>
        </div>

        {/* Notes Grid */}
        <div className="notes-grid">
          {notes.length === 0 ? (
            <div className="empty-state">
              <p>You have no notes yet. Create your first note!</p>
            </div>
          ) : (
            notes.map(note => (
              <div key={note.id} className="note-card">
                <div className="note-card-header">
                  <h3 className="note-title">{note.title}</h3>
                  <div className="note-actions">
                    <button 
                      className="note-action-btn edit"
                      onClick={() => startEdit(note)}
                      title="Edit note"
                    >
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M11.3333 2.00004C11.5084 1.82494 11.7163 1.68605 11.9451 1.59129C12.1739 1.49653 12.419 1.44775 12.6667 1.44775C12.9143 1.44775 13.1594 1.49653 13.3882 1.59129C13.617 1.68605 13.8249 1.82494 14 2.00004C14.1751 2.17513 14.314 2.383 14.4088 2.61178C14.5036 2.84055 14.5523 3.08565 14.5523 3.33337C14.5523 3.58109 14.5036 3.82619 14.4088 4.05497C14.314 4.28374 14.1751 4.49161 14 4.66671L5 13.6667L1.33333 14.6667L2.33333 11L11.3333 2.00004Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                    <button 
                      className="note-action-btn delete"
                      onClick={() => handleDelete(note.id)}
                      title="Delete note"
                    >
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M2 4H3.33333H14M5.33333 4V2.66667C5.33333 2.31304 5.47381 1.97391 5.72386 1.72386C5.97391 1.47381 6.31304 1.33333 6.66667 1.33333H9.33333C9.68696 1.33333 10.0261 1.47381 10.2761 1.72386C10.5262 1.97391 10.6667 2.31304 10.6667 2.66667V4M12.6667 4V13.3333C12.6667 13.687 12.5262 14.0261 12.2761 14.2761C12.0261 14.5262 11.687 14.6667 11.3333 14.6667H4.66667C4.31304 14.6667 3.97391 14.5262 3.72386 14.2761C3.47381 14.0261 3.33333 13.687 3.33333 13.3333V4H12.6667Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                  </div>
                </div>
                <p className="note-content">{note.content}</p>
                <p className="note-date">{formatDate(note.updated_at)}</p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingNoteId ? 'Edit Note' : 'Create New Note'}</h2>
              <button className="modal-close" onClick={closeModal}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
            <form onSubmit={handleNoteSubmit}>
              <div className="form-group">
                <label>Title</label>
                <input
                  type="text"
                  placeholder="Note title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Content</label>
                <textarea
                  placeholder="Write your note here..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows="5"
                  required
                ></textarea>
              </div>
              <div className="modal-actions">
                <button type="button" className="cancel-button" onClick={closeModal}>
                  Cancel
                </button>
                <button type="submit" className="submit-button">
                  {editingNoteId ? 'Save Changes' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
