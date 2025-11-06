// src/components/Register.js
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = 'http://localhost:8000'; // Match your FastAPI server URL

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    try {
      const response = await axios.post(`${API_BASE_URL}/auth/register`, {
        email,
        password,
      });
      
      setMessage(`Registration successful! User ID: ${response.data.user_id}`);
      // Redirect to login after successful registration
      setTimeout(() => navigate('/login'), 2000); 

    } catch (error) {
      // Display the error message from FastAPI (e.g., "User with this email already exists")
      const errorMsg = error.response?.data?.detail || 'Registration failed.';
      setMessage(`Error: ${errorMsg}`);
    }
  };

  return (
    <div className="card p-4">
      <h2 className="mb-4">Sign Up</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="email" className="form-label">Email</label>
          <input
            type="email"
            className="form-control"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="mb-3">
          <label htmlFor="password-register" className="form-label">Password</label>
          <input
            type="password"
            className="form-control"
            id="password-register"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="btn btn-primary">Register</button>
      </form>
      {message && <p className={`mt-3 ${message.includes('Error') ? 'text-danger' : 'text-success'}`}>{message}</p>}
    </div>
  );
};

export default Register;