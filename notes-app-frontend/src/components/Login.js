// src/components/Login.js
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

const API_BASE_URL = 'http://localhost:8000'; 

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    try {
      const response = await axios.post(`${API_BASE_URL}/auth/login`, {
        email,
        password,
      });

      // 1. Get token and user ID from the backend response
      const token = response.data.access_token;
      const userId = response.data.user_id;
      
      // 2. Store the token and user ID using the context login function
      login(token, userId); 
      
      setMessage('Login successful!');
      // 3. Navigate to the protected dashboard
      navigate('/dashboard');

    } catch (error) {
      const errorMsg = error.response?.data?.detail || 'Login failed.';
      setMessage(`Error: ${errorMsg}`);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1 className="auth-title">Notify</h1>
        <p className="auth-subtitle">Login to access your notes</p>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email-login">Email</label>
            <input
              type="email"
              id="email-login"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password-login">Password</label>
            <input
              type="password"
              id="password-login"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          <button type="submit" className="auth-button">Login</button>
        </form>
        
        {message && <p className={`auth-message ${message.includes('Error') ? 'error' : 'success'}`}>{message}</p>}
        
        <p className="auth-footer">
          Don't have an account? <Link to="/register" className="auth-link">Sign Up</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
