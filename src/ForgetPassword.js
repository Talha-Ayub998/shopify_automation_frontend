import React, { useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    // Handle email change
    const handleChange = (value) => {
        setEmail(value);
    };

    // Handle password reset request
    const handleRequestReset = async () => {
        setError('');

        try {
            // Replace with your password reset request API endpoint and method
            const response = await fetch('/api/request-password-reset', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                // Handle success (e.g., show success message)
                console.log('Password reset request successful');
                // Redirect or show success message
            } else {
                setError(data.message || 'An error occurred');
            }
        } catch (error) {
            setError('An error occurred');
        }
    };

    // Handle going back to the previous page
    const handleBack = () => {
        navigate('/signin')
        // Implement your navigation logic here
        console.log('Going back');
        // Redirect or navigate to the previous page
    };

    return (
        <Container>
            <MailIcon>🔒</MailIcon>
            <Title>Forgot Your Password?</Title>
            <Description>
                Enter your email address below to request a password reset link.
            </Description>
            <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={e => handleChange(e.target.value)}
            />
            {error && <Error>{error}</Error>}
            <SubmitButton onClick={handleRequestReset}>Reset password</SubmitButton>
            <BackButton onClick={handleBack}>Back</BackButton>
        </Container>
    );
};

export default ForgotPassword;



const Container = styled.div`
    text-align: center;
    background-color: white;
    padding: 40px;
    border-radius: 10px;
    box-shadow: 0px 0px 5px rgba(0, 0, 0, 0.1); // Reduce the blur effect
    max-width: 400px;
    margin: 0 auto;
    margin-top: 100px;
`;

const MailIcon = styled.div`
    font-size: 40px;
    margin-bottom: 20px;
`;

const Title = styled.h2`
    margin: 0;
    font-size: 24px;
`;

const Description = styled.p`
    margin: 10px 0 20px;
`;

const Input = styled.input`
    width: 100%;
    height: 40px;
    margin: 10px 0;
    padding: 0 10px;
    font-size: 16px;
    border: 1px solid #ddd;
    border-radius: 5px;
`;

const Error = styled.div`
    color: red;
    margin-bottom: 20px;
`;

const SubmitButton = styled.button`
    display: inline-block;
    width: 100%;
    padding: 10px;
    margin: 10px 0;
    font-size: 16px;
    background-color: #1976D2;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
`;

const BackButton = styled.button`
    background: none;
    border: none;
    color: #007bff;
    cursor: pointer;
    font-size: 16px;
`;