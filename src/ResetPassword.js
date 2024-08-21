import React, { useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import api from './api';
import { Oval } from 'react-loader-spinner';
import { ToastContainer, toast } from 'react-toastify';
import { useAuth } from './AuthContext';

const ResetPassword = () => {
    const [email, setEmail] = useState('');
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { setPasswordChanges } = useAuth();


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
        if (!newPassword || !confirmPassword || !oldPassword) {
            toast.error('All fields are required.', {
                position: 'top-right',
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
            });
            return;
        }

        // Check if passwords match
        if (newPassword !== confirmPassword) {
            setError('Passwords do not match');
            toast.error('Passwords do not match', {
                position: 'top-right',
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
            });
            return;
        }
        setLoading(true);
        try {
            const response = await api.post('auth/users/change-password/', { new_password: newPassword, current_password: oldPassword });
            setPasswordChanges(true);
            navigate('/chatpage')
        } catch (error) {
            console.log(error.response.data);
            let errorMsg = error.message || 'An error occurred'; // Default message
            if (error.response.data) {
                // Extract detailed error messages if available
                errorMsg = Object.values(error.response.data).flat().join(', ');
            } else {
                // Fallback message if response data is empty
                errorMsg = error.response.statusText || 'An error occurred';
            }
            toast.error(errorMsg, {
                position: 'top-right',
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
            });
        } finally {
            setLoading(false);
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
        <>
            <Container>
                {loading && (
                    <LoadingContainer>
                        <Oval
                            height={100}
                            width={100}
                            color="#4fa94d"
                            visible={true}
                            ariaLabel='oval-loading'
                            secondaryColor="#4fa94d"
                            strokeWidth={2}
                            strokeWidthSecondary={2}
                        />
                    </LoadingContainer>
                )}
                <MailIcon>🔑</MailIcon>
                <Title>Password reset</Title>
                <Description>
                    Set a new password
                </Description>
                <Input
                    type="password"
                    name="oldPassword"
                    placeholder="Old Password"
                    value={oldPassword}
                    onChange={e => handleChange(e.target.name, e.target.value)}
                />
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
                <ResetButton onClick={handleResetPassword}>Reset Password</ResetButton>
                <BackButton onClick={handleBack}>Back</BackButton>
            </Container>
            <ToastContainer />
        </>
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
    font-family: 'Inter', Arial, sans-serif;
`;

const MailIcon = styled.div`
    font-size: 40px;
    margin-bottom: 20px;
    font-family: 'Inter', Arial, sans-serif;
`;

const Title = styled.h2`
    margin: 0;
    font-size: 24px;
    font-family: 'Inter', Arial, sans-serif;
`;

const Description = styled.p`
    margin: 10px 0 20px;
    font-family: 'Inter', Arial, sans-serif;
`;

const Input = styled.input`
    width: 100%;
    height: 40px;
    margin: 10px 0;
    padding: 0 10px;
    font-size: 16px;
    border: 1px solid #ddd;
    border-radius: 5px;
    font-family: 'Inter', Arial, sans-serif;
`;

const Error = styled.div`
    color: red;
    margin-bottom: 20px;
    font-family: 'Inter', Arial, sans-serif;
`;

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
    font-family: 'Inter', Arial, sans-serif;
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
    font-family: 'Inter', Arial, sans-serif;
`;

const BackButton = styled.button`
    background: none;
    border: none;
    color: #007bff;
    cursor: pointer;
    font-size: 16px;
    font-family: 'Inter', Arial, sans-serif;
`;