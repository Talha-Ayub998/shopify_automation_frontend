import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [loginSuccess, setLoginSuccess] = useState(false); // Add loginSuccess flag
    const navigate = useNavigate();

    useEffect(() => {
        const checkAuth = () => {
            const token = localStorage.getItem('authToken');
            setIsAuthenticated(!!token);
            setIsLoading(false);
        };

        window.addEventListener('storage', checkAuth);
        checkAuth();

        return () => window.removeEventListener('storage', checkAuth);
    }, []);

    const login = (token) => {
        localStorage.setItem('authToken', token);
        setIsAuthenticated(true);
        setLoginSuccess(true); // Set loginSuccess flag on login
    };

    const logout = () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userId');
        localStorage.removeItem('sessionId');
        setIsAuthenticated(false);
        navigate('/signin');
    };

    if (isLoading) {
        return <div>Loading...</div>; // Or any loading indicator
    }

    return (
        <AuthContext.Provider value={{ isAuthenticated, login, logout, loginSuccess, setLoginSuccess }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
