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
                {/* Removed the Navbar Brand Link text here as well to keep it clean */}
                <Link className="navbar-brand" to="/dashboard"></Link> 
                
                <div className="collapse navbar-collapse">
                    <ul className="navbar-nav ms-auto">
                        {isAuthenticated ? (
                            // ⬅️ AUTHENTICATED LINKS REMOVED TO PREVENT UNSTYLED DUPLICATION 
                            <>
                            {/* Dashboard and Logout links were here. Keeping this block empty hides them. */}
                            </>
                        ) : (
                            <>
                                {!isAuthPage && ( // Only render Login/Register links if not on those pages
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