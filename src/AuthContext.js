import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Oval } from 'react-loader-spinner';
import styled from 'styled-components'; // Import styled-components

const AuthContext = createContext();

const LoadingContainer = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    width: 100vw;
    position: fixed;
    top: 0;
    left: 0;
    background-color: rgba(255, 255, 255, 0.8);
    z-index: 9999;
`;

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoggingOut, setIsLoggingOut] = useState(false); // New state for logging out
    const [loginSuccess, setLoginSuccess] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const checkAuth = () => {
            const token = localStorage.getItem('authToken');
            setIsAuthenticated(!!token);
            // Set a 2-second delay before removing the loading state
            setIsLoading(false);
        };

        window.addEventListener('storage', checkAuth);
        checkAuth();

        return () => window.removeEventListener('storage', checkAuth);
    }, []);

    const login = (token) => {
        localStorage.setItem('authToken', token);
        setIsAuthenticated(true);
        setLoginSuccess(true);
    };

    const logout = () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userId');
        localStorage.removeItem('sessionId');
        localStorage.removeItem('userEmail');
        setIsAuthenticated(false);
        navigate('/signin');
        setIsLoggingOut(false); // Reset logging out state
    };

    if (isLoading) { // Show spinner if loading or logging out
        return (
            <LoadingContainer>
                <Oval
                    height={100}
                    width={100}
                    color="#4fa94d"
                    wrapperStyle={{}}
                    wrapperClass=""
                    visible={true}
                    ariaLabel='oval-loading'
                    secondaryColor="#4fa94d"
                    strokeWidth={2}
                    strokeWidthSecondary={2}
                />
            </LoadingContainer>
        );
    }

    return (
        <AuthContext.Provider value={{ isAuthenticated, login, logout, loginSuccess, setLoginSuccess }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
