// src/components/NotFound.js
import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

const NotFoundContainer = styled.div`
    text-align: center;
    padding: 50px;
    background-color: #f4f4f4;
`;

const NotFound = () => (
    <NotFoundContainer>
        <h1>404 - Page Not Found</h1>
        <p>Sorry, the page you are looking for does not exist.</p>
        <Link to="/">Go to Home</Link>
    </NotFoundContainer>
);

export default NotFound;
