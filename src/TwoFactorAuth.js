import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import axios from 'axios';



const TwoFactorAuth = () => {
    const [otp, setOtp] = useState(new Array(6).fill(""));
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const { login } = useAuth();
    const user_id = localStorage.getItem('userId');
    const email = localStorage.getItem('userEmail');
    const [message, setMessage] = useState('');

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
            const response = await axios.post('http://127.0.0.1:8000/api/auth/users/resend_otp/', { user_id });
            console.log('resend_otp successful:', response.data);
            setMessage(response.data.message);
        } catch (error) {
            setMessage('Error resending OTP');
        }
    };
    const handleVerifyOtp = async (e) => {
        e.preventDefault(); // Prevent form submission
        try {
            const response = await axios.post('http://127.0.0.1:8000/api/auth/users/verify_otp/', {
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

    return (
        <div style={styles.container}>
            <div style={styles.mailIcon}>📧</div>
            <h2 style={styles.title}>We've emailed you a code</h2>
            <p style={styles.description}>
                To continue account setup, enter the code we've sent to: <strong>{email}</strong>
            </p>
            <div>
                {otp.map((data, index) => {
                    return (
                        <input
                            type="text"
                            name="otp"
                            maxLength="1"
                            key={index}
                            value={data}
                            onChange={e => handleChange(e.target, index)}
                            onFocus={e => e.target.select()}
                            onKeyDown={e => handleKeyDown(e, index)}
                            style={styles.codeInput}
                        />
                    );
                })}
            </div>
            {error && <div style={styles.error}>{error}</div>}
            <button onClick={handleVerifyOtp} style={styles.verifyButton}>
                Verify
            </button>
            <div style={styles.resend}>
                <span>Didn't get the code?</span>
                <a href="#" style={styles.resendLink} onClick={handleResendOtp}>Resend it</a>
            </div>
            <button onClick={handleBack} style={styles.backButton}>Back</button>
        </div>
    );
};

const styles = {
    container: {
        textAlign: 'center',
        backgroundColor: 'white',
        padding: '40px',
        borderRadius: '10px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        maxWidth: '400px',
        margin: '0 auto',
        marginTop: '100px',
    },
    mailIcon: {
        fontSize: '40px',
        marginBottom: '20px',
    },
    title: {
        margin: '0',
        fontSize: '24px',
    },
    description: {
        margin: '10px 0 20px',
    },
    codeInputs: {
        display: 'flex',
        justifyContent: 'center',
        marginBottom: '20px',
    },
    codeInput: {
        width: '40px',
        height: '40px',
        margin: '0 5px',
        textAlign: 'center',
        fontSize: '20px',
        border: '1px solid #ddd',
        borderRadius: '5px',
    },
    error: {
        color: 'red',
        marginBottom: '20px',
    },
    verifyButton: {
        display: 'inline-block',
        width: '100%',
        padding: '10px',
        margin: '10px 0',
        fontSize: '16px',
        backgroundColor: 'black',
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
    },
    resend: {
        margin: '20px 0',
    },
    resendLink: {
        color: '#007bff',
        textDecoration: 'none',
        marginLeft: '5px',
    },
    backButton: {
        background: 'none',
        border: 'none',
        color: '#007bff',
        cursor: 'pointer',
        fontSize: '16px',
    }
};

export default TwoFactorAuth;

