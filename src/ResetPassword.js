import React, { useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';


const ResetPassword = () => {
    const [email, setEmail] = useState('');
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();


    // Handle input changes
    const handleChange = (name, value) => {
        if (name === 'email') {
            setEmail(value);
        } else if (name === 'oldPassword') {
            setOldPassword(value);
        } else if (name === 'newPassword') {
            setNewPassword(value);
        } else if (name === 'confirmPassword') {
            setConfirmPassword(value);
        }
    };

    // Handle password reset
    const handleResetPassword = async () => {
        setError('');

        // Check if passwords match
        if (newPassword !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        try {
            // Replace with your password reset API endpoint and method
            const response = await fetch('/api/reset-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email,
                    oldPassword,
                    newPassword,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                // Handle success (e.g., redirect to login page)
                console.log('Password reset successful');
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
        navigate('/chatpage')
        // Implement your navigation logic here
        console.log('Going back');
        // Redirect or navigate to the previous page
    };

    return (
        <Container>
            <MailIcon>🔑</MailIcon>
            <Title>Password reset</Title>
            <Description>
                Set a new password
            </Description>
            <Input
                type="password"
                name="newPassword"
                placeholder="New Password"
                value={newPassword}
                onChange={e => handleChange(e.target.name, e.target.value)}
            />
            <Input
                type="password"
                name="confirmPassword"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={e => handleChange(e.target.name, e.target.value)}
            />
            {error && <Error>{error}</Error>}
            <ResetButton onClick={handleResetPassword}>Reset Password</ResetButton>
            <BackButton onClick={handleBack}>Back</BackButton>
        </Container>
    );
};

export default ResetPassword;




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

const ResetButton = styled.button`
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