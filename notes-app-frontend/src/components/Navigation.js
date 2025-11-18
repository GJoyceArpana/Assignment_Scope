// src/components/Navigation.js
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navigation = () => {
    const { isAuthenticated, logout } = useAuth();
    const location = useLocation();
    
    // Check if the current path is /login or /register
    const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

    return (
        <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
            <div className="container">
                {/* Brand Link: Changed text to empty string to hide "Notes App" */}
                <Link className="navbar-brand" to="/dashboard"></Link> 
                
                <div className="collapse navbar-collapse">
                    <ul className="navbar-nav ms-auto">
                        
                        {/* Case 1: Authenticated (No links rendered here) */}
                        {isAuthenticated ? (
                            <>
                            {/* Dashboard and Logout links intentionally removed from the top navigation to prevent unstyled duplication on the dashboard screen. */}
                            </>
                        ) : (
                            // Case 2 & 3: Unauthenticated
                            <>
                                {/* Only render Login/Register links if NOT on the Login/Register page */}
                                {!isAuthPage && ( 
                                    <>
                                        <li className="nav-item">
                                            <Link className="nav-link" to="/login">Login</Link>
                                        </li>
                                        <li className="nav-item">
                                            <Link className="nav-link" to="/register">Register</Link>
                                        </li>
                                    </>
                                )}
                            </>
                        )}
                    </ul>
                </div>
            </div>
        </nav>
    );
};

export default Navigation;