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

const theme = createTheme();

export default function SignUp() {
    const [mfaEnabled, setMfaEnabled] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (mfaEnabled) {
            setLoading(true);
            navigate('/2fa');
            // Delay the navigation to allow the loader to be visible
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
        const shopifyStoreUrl = data.get('shopifyUrl');
        const shopifyAccessToken = data.get('accessToken');

        // Check if any of the required fields are empty
        if (!username || !email || !password || !shopifyStoreUrl || !shopifyAccessToken) {
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
            // Send the registration request
            setLoading(true);
            const response = await api.post('auth/users/register/', {
                username,
                email,
                password,
                shopify_store_url: shopifyStoreUrl,
                shopify_access_token: shopifyAccessToken,
            });
            // console.log('Sign up successful:', response.data);
            setMfaEnabled(true);
            console.log('Sign up successful:', response.data);
            localStorage.setItem('userId', response.data.user_id);
            localStorage.setItem('userEmail', response.data.user_email);
        } catch (error) {
            console.error('Sign up error:', error.response?.data);

            // Handle sign-up error with a user-friendly toast
            let errorMessage = 'An error occurred'; // Default message

            if (error.response && error.response.data) {
                if (Array.isArray(error.response.data.non_field_errors) && error.response.data.non_field_errors.length > 0) {
                    errorMessage = error.response.data.non_field_errors.join(', ');
                } else if (error.response.data.error) {
                    errorMessage = error.response.data.error;
                } else if (error.response.data.shopify_store_url) {
                    errorMessage = error.response.data.shopify_store_url[0]; // Specific error for shopify_store_url
                }
            }

            // Ensure errorMessage is a string before passing to toast.error
            const errorMsg = typeof errorMessage === 'string' ? errorMessage : errorMessage.toString();

            toast.error(errorMsg, {
                position: 'top-right',
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
            });
        }
        finally {
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
                                        {"Don't have an account? Sign Up"}
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
            <Link color="inherit" href="#">
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
