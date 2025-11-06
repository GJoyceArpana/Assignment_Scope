// src/components/Login.js
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

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
    <div className="card p-4">
      <h2 className="mb-4">Log In</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="email-login" className="form-label">Email</label>
          <input
            type="email"
            className="form-control"
            id="email-login"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="mb-3">
          <label htmlFor="password-login" className="form-label">Password</label>
          <input
            type="password"
            className="form-control"
            id="password-login"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="btn btn-success">Login</button>
      </form>
      {message && <p className={`mt-3 ${message.includes('Error') ? 'text-danger' : 'text-success'}`}>{message}</p>}
    </div>
  );
};

export default Login;