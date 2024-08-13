import React, { useEffect, useState } from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Link from '@mui/material/Link';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import api from './api';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Oval } from 'react-loader-spinner';
import styled from 'styled-components';
import { useAuth } from './AuthContext';

const theme = createTheme();

export default function SignUp() {
    const [mfaEnabled, setMfaEnabled] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { setIsSignupComplete } = useAuth();
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');

    useEffect(() => {
        const storedUsername = localStorage.getItem('signup_name');
        const storedEmail = localStorage.getItem('signup_email');
        const storedPhoneNumber = localStorage.getItem('signup_number');

        if (storedUsername) setUsername(storedUsername);
        if (storedEmail) setEmail(storedEmail);
        if (storedPhoneNumber) setPhoneNumber(storedPhoneNumber);
    }, []);

    useEffect(() => {
        if (mfaEnabled) {
            setLoading(true);
            navigate('/2fa');
        }
    }, [mfaEnabled, navigate]);

    const handleNavigate = (event) => {
        event.preventDefault();
        navigate('/signin');
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        const data = new FormData(event.target);
        const username = data.get('username');
        const email = data.get('email');
        const password = data.get('password');
        const phoneNumber = data.get('phoneNumber'); // Corrected variable name
        const shopifyStoreUrl = data.get('shopifyUrl');
        const shopifyAccessToken = data.get('accessToken');

        if (!username || !email || !password || !shopifyStoreUrl || !shopifyAccessToken || !phoneNumber) {
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
        try {
            setLoading(true);
            const response = await api.post('auth/users/register/', {
                username,
                email,
                password,
                phone_number: phoneNumber, // Corrected variable name
                shopify_store_url: shopifyStoreUrl,
                shopify_access_token: shopifyAccessToken,
            });
            setMfaEnabled(true);
            setIsSignupComplete(true);
            localStorage.setItem('userId', response.data.user_id);
            localStorage.setItem('userEmail', response.data.user_email);
            localStorage.removeItem('signup_name');
            localStorage.removeItem('signup_email');
            localStorage.removeItem('signup_number');
        } catch (error) {
            console.error('Sign up error:', error.response?.data);
            let errorMessage = 'An error occurred';
            if (error.response && error.response.data) {
                if (Array.isArray(error.response.data.non_field_errors) && error.response.data.non_field_errors.length > 0) {
                    errorMessage = error.response.data.non_field_errors.join(', ');
                } else if (error.response.data.error) {
                    errorMessage = error.response.data.error;
                } else if (error.response.data.shopify_store_url) {
                    errorMessage = error.response.data.shopify_store_url[0];
                }
            }
            toast.error(errorMessage, {
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

    return (
        <>
            {loading &&
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
            }
            <ThemeProvider theme={theme}>
                <Container component="main" maxWidth="xs">
                    <CssBaseline />
                    <Box
                        sx={{
                            marginTop: 8,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                        }}
                    >
                        <Avatar sx={{ m: 1, bgcolor: theme.palette.secondary.main }}>
                            <LockOutlinedIcon />
                        </Avatar>
                        <Typography component="h1" variant="h5">
                            Sign up
                        </Typography>
                        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 3 }}>
                            <Grid container spacing={2}>
                                <Grid item xs={12}>
                                    <TextField
                                        autoComplete="given-name"
                                        name="username"
                                        required
                                        fullWidth
                                        id="username"
                                        label="Username"
                                        autoFocus
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        required
                                        fullWidth
                                        id="email"
                                        label="Email Address"
                                        name="email"
                                        autoComplete="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        required
                                        fullWidth
                                        id="phonenumber"
                                        label="Phone Number"
                                        name="phoneNumber"
                                        autoComplete="tel"
                                        value={phoneNumber}
                                        onChange={(e) => setPhoneNumber(e.target.value)}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        required
                                        fullWidth
                                        name="password"
                                        label="Password"
                                        type="password"
                                        id="password"
                                        autoComplete="new-password"
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        required
                                        fullWidth
                                        id="shopifyUrl"
                                        label="Shopify Url"
                                        name="shopifyUrl"
                                        autoComplete="shopifyUrl"
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        required
                                        fullWidth
                                        id="accessToken"
                                        label="Access Token"
                                        name="accessToken"
                                        autoComplete="accessToken"
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <FormControlLabel
                                        control={<Checkbox value="allowExtraEmails" color="primary" />}
                                        label="I want to receive inspiration, marketing promotions and updates via email."
                                        name="allowExtraEmails"
                                    />
                                </Grid>
                            </Grid>
                            <Button
                                type="submit"
                                fullWidth
                                variant="contained"
                                color="primary"
                                sx={{ mt: 3, mb: 2 }}
                            >
                                Sign Up
                            </Button>
                            <Grid container justifyContent="flex-end">
                                <Grid item>
                                    <Link
                                        onClick={handleNavigate}
                                        variant="body2"
                                        sx={{
                                            cursor: 'pointer' // Ensure the cursor is a pointer
                                        }}
                                    >
                                        {"Already have an account? Sign in"}
                                    </Link>
                                </Grid>
                            </Grid>
                        </Box>
                    </Box>
                    <Copyright sx={{ mt: 8, mb: 4 }} />
                </Container>
                <ToastContainer />
            </ThemeProvider>
        </>
    );
}


function Copyright(props) {
    return (
        <Typography variant="body2" color="text.secondary" align="center" {...props}>
            {'Copyright © '}
            <Link color="inherit" href="http://35.226.248.205/home/">
                Your Website
            </Link>{' '}
            {new Date().getFullYear()}
            {'.'}
        </Typography>
    );
}

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
