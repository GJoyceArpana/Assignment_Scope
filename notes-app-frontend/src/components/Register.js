// src/components/Register.js
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import './Auth.css';

const API_BASE_URL = 'http://localhost:8000'; // Match your FastAPI server URL

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    if (password !== confirmPassword) {
      setMessage('Error: Passwords do not match.');
      return;
    }

    try {
      const response = await axios.post(`${API_BASE_URL}/auth/register`, {
        email,
        password,
      });
      
      setMessage('Registration successful! Redirecting to login...');
      // Redirect to login after successful registration
      setTimeout(() => navigate('/login'), 2000); 

    } catch (error) {
      // Display the error message from FastAPI (e.g., "User with this email already exists")
      const errorMsg = error.response?.data?.detail || 'Registration failed.';
      setMessage(`Error: ${errorMsg}`);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1 className="auth-title">Notify</h1>
        <p className="auth-subtitle">Create an account to get started</p>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password-register">Password</label>
            <input
              type="password"
              id="password-register"
              placeholder="Create a password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="confirm-password">Confirm Password</label>
            <input
              type="password"
              id="confirm-password"
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          
          <button type="submit" className="auth-button">Sign Up</button>
        </form>
        
        {message && <p className={`auth-message ${message.includes('Error') ? 'error' : 'success'}`}>{message}</p>}
        
        <p className="auth-footer">
          Already have an account? <Link to="/login" className="auth-link">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
