// src/context/AuthContext.js
import React, { createContext, useState, useContext } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    // State to hold the token and user ID
    const [token, setToken] = useState(localStorage.getItem('token') || null);
    const [userId, setUserId] = useState(localStorage.getItem('userId') || null);
    
    // Function to set token and user ID on successful login
    const login = (newToken, newUserId) => {
        localStorage.setItem('token', newToken);
        localStorage.setItem('userId', newUserId);
        setToken(newToken);
        setUserId(newUserId);
    };
    
    // Function to clear state and storage on logout
    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        setToken(null);
        setUserId(null);
    };
    
    // True if token exists
    const isAuthenticated = !!token;

    return (
        <AuthContext.Provider value={{ token, userId, isAuthenticated, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};