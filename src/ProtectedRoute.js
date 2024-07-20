import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';

const ProtectedRoute = ({ element }) => {
    const { isAuthenticated } = useAuth();
    const location = useLocation();

    return isAuthenticated ?
        element :
        <Navigate to="/signin" state={{ from: location }} replace />;
};

export default ProtectedRoute;