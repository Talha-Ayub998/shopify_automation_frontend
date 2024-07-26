import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import axios from 'axios';
import styled from 'styled-components';
import api from './api';



const TwoFactorAuth = () => {
    const [otp, setOtp] = useState(new Array(6).fill(""));
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const { login, isSignupComplete } = useAuth();
    const user_id = localStorage.getItem('userId');
    const email = localStorage.getItem('userEmail');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!isSignupComplete) {
            navigate('/signup'); // Redirect to signup if 2FA is accessed directly
        } else {
            setLoading(false); // Continue rendering if signup is complete
        }
    }, [isSignupComplete, navigate]);

    const handleChange = (element, index) => {
        if (isNaN(element.value)) return false;

        setOtp([...otp.map((d, idx) => (idx === index ? element.value : d))]);

        // Focus next input box if current value is filled
        if (element.value !== "" && element.nextSibling) {
            element.nextSibling.focus();
        }
    };

    const handleKeyDown = (e, index) => {
        // Handle backspace
        if (e.key === "Backspace" && otp[index] === "") {
            if (e.target.previousSibling) {
                e.target.previousSibling.focus();
            }
        }
    };

    const handleResendOtp = async () => {
        try {
            const response = await api.post('auth/users/resend_otp/', { user_id });
            console.log('resend_otp successful:', response.data);
            setMessage(response.data.message);
        } catch (error) {
            setMessage('Error resending OTP');
        }
    };
    const handleVerifyOtp = async (e) => {
        e.preventDefault(); // Prevent form submission
        try {
            const response = await api.post('auth/users/verify_otp/', {
                otp: otp.join(''), // Join the OTP array into a string before sending it
                user_id
            });
            const { token } = response.data;

            // Store token in local storage
            localStorage.setItem('userId', response.data.user.id);
            localStorage.setItem('sessionId', response.data.session_id);
            localStorage.setItem('userEmail', response.data.user.email);
            login(token); // Set authentication state
            navigate('/chatpage');
        } catch (error) {
            let errorMessage = 'Invalid OTP Or OTP is expired. Please Resend';
            setError(errorMessage);
        }
    };

    const handleBack = async (e) => {
        e.preventDefault(); // Prevent form submission
        navigate('/signup');

    };

    if (loading) {
        return; // Optional: Show a loading spinner or placeholder
    }

    return (
        <Container>
            <MailIcon>📧</MailIcon>
            <Title>We've emailed you a code</Title>
            <Description>
                To continue account setup, enter the code we've sent to: <strong>{email}</strong>
            </Description>
            <CodeInputs>
                {otp.map((data, index) => (
                    <CodeInput
                        type="text"
                        name="otp"
                        maxLength="1"
                        key={index}
                        value={data}
                        onChange={e => handleChange(e.target, index)}
                        onFocus={e => e.target.select()}
                        onKeyDown={e => handleKeyDown(e, index)}
                    />
                ))}
            </CodeInputs>
            {error && <Error>{error}</Error>}
            <VerifyButton onClick={handleVerifyOtp}>Verify</VerifyButton>
            <Resend>
                <span>Didn't get the code?</span>
                <ResendLink href="#" onClick={handleResendOtp}>Resend it</ResendLink>
            </Resend>
            <BackButton onClick={handleBack}>Back</BackButton>
        </Container>
    );
};


export default TwoFactorAuth;


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

const CodeInputs = styled.div`
    display: flex;
    justify-content: center;
    margin-bottom: 20px;
`;

const CodeInput = styled.input`
    width: 40px;
    height: 40px;
    margin: 0 5px;
    text-align: center;
    font-size: 20px;
    border: 1px solid #ddd;
    border-radius: 5px;
`;

const Error = styled.div`
    color: red;
    margin-bottom: 20px;
`;

const VerifyButton = styled.button`
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

const Resend = styled.div`
    margin: 20px 0;
`;

const ResendLink = styled.a`
    color: #007bff;
    text-decoration: none;
    margin-left: 5px;
`;

const BackButton = styled.button`
    background: none;
    border: none;
    color: #007bff;
    cursor: pointer;
    font-size: 16px;
`;