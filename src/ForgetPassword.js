import React, { useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import api from './api';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Oval } from 'react-loader-spinner';
import { useAuth } from './AuthContext';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { setpasswordResetSuccess } = useAuth();

    const navigate = useNavigate();

    // Handle email change
    const handleChange = (value) => {
        setEmail(value);
    };

    // Handle password reset request
    const handleRequestReset = async () => {
        if (!email) {
            toast.error('Email field are required.', {
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
        setError('');
        setLoading(true); // Assuming you have a loading state

        try {
            const response = await api.post('auth/users/request-password-reset/', {
                email,
            });

            if (response.status === 200) {
                setpasswordResetSuccess(true);
                console.log('Password reset request successful');
                navigate('/signin')
                // Redirect or show success message
            } else {
                setError(response.data.detail || 'An error occurred');
            }
        } catch (error) {
            console.log(error.response?.data || error);
            let errorMsg = error.message || 'An error occurred'; // Default message
            if (error.response && error.response.data) {
                // Extract detailed error messages if available
                errorMsg = Object.values(error.response.data).flat().join(', ');
            } else if (error.response) {
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
            setLoading(false); // Ensure loading is set to false in all cases
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
        <>
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
            <ToastContainer />
        </>
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