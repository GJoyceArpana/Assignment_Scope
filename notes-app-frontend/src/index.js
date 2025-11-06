// src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
// Import the AuthProvider
import { AuthProvider } from './context/AuthContext'; 

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    {/* Wrap the entire App with the AuthProvider */}
    <AuthProvider> 
        <App />
    </AuthProvider>
  </React.StrictMode>
);