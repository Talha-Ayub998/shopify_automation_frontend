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
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import api from './api';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Paper from '@mui/material/Paper';
// import signInSideBg from './sign-in-side-bg.png'; // Make sure the path is correct
import signInSideBg from './Ecomaitech.com.png' // Make sure the path is correct
import styled from 'styled-components';

// TODO remove, this demo shouldn't need to reset the theme.
const defaultTheme = createTheme({
  typography: {
    fontFamily: 'Inter, Arial, sans-serif',
  },
});



export default function SignIn() {

    const navigate = useNavigate();
    const { login, passwordResetSuccess, setpasswordResetSuccess } = useAuth();
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const authToken = localStorage.getItem('authToken');
        if (authToken) navigate('/chatpage');

    }, []);


    useEffect(() => {
        if (passwordResetSuccess) {
            toast.success('A new password has been sent to your email address.', {
                position: 'top-right',
                autoClose: 2000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
            });
        }
        setpasswordResetSuccess(false); // Reset login success flag
    }, [passwordResetSuccess, setpasswordResetSuccess]);

    const handleNavigate = (event) => {
        event.preventDefault();
        navigate('/signup');
    };

    const handleNavigate2 = (event) => {
        event.preventDefault();
        navigate('/forgetpassword');
    };

    const handleSubmit = async (event) => {
        event.preventDefault(); // Prevent default form submission behavior

        const data = new FormData(event.currentTarget); // Get form data
        const email = data.get('email'); // Extract email
        const password = data.get('password'); // Extract password

        // Simple validation
        if (!email || !password) {
            toast.error('Please enter both email and password.', {
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
            // Send login request
            const response = await api.post('auth/users/login/', { email, password });
            const { token } = response.data;

            // Store token in local storage
            localStorage.setItem('userId', response.data.user.id);
            localStorage.setItem('sessionId', response.data.session_id);
            localStorage.setItem('userEmail', response.data.user.email);

            login(token); // Set authentication state
            // Redirect to the chat page
            navigate('/chatpage');
        } catch (error) {
            // Initialize default error message
            let errorMessage = 'An error occurred. Please try again.';

            if (error.response && error.response.data) {
                const errorData = error.response.data;
                let errorMessages = [];

                // Handle non_field_errors specifically
                if (errorData.non_field_errors) {
                    errorMessages = errorData.non_field_errors; // Only take the message(s)
                } else {
                    // Collect other error messages
                    for (const [key, value] of Object.entries(errorData)) {
                        if (Array.isArray(value)) {
                            errorMessages.push(...value); // Flatten the array of messages
                        } else {
                            errorMessages.push(value); // Add the value if it's not an array
                        }
                    }
                }

                // Use the first message from the array as the error message
                if (errorMessages.length > 0) {
                    errorMessage = errorMessages.join(', '); // Join multiple messages if needed
                }
            }

            console.error('Sign in error:', errorMessage);

            // Ensure errorMessage is a string before passing to toast.error
            const errorMsg = typeof errorMessage === 'string' ? errorMessage : errorMessage.toString();

            toast.error(
                errorMsg, // Directly pass the error message
                {
                    position: 'top-right',
                    autoClose: 3000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                }
            );
            if (error.response && error.response.status === 403) {
                // Redirect to the pricing page after 5 seconds
                setTimeout(() => {
                    window.location.href = 'https://ecomaitech.com/home/#pricing';
                }, 2500);
            }
        }


    };

    return (
        <ThemeProvider theme={defaultTheme}>
            <Grid container component="main" sx={{ height: '100vh' }}>
                <CssBaseline />
                <Grid
                    item
                    xs={false}
                    sm={4}
                    md={7}
                    sx={{
                        backgroundImage: `url(${signInSideBg})`,
                        backgroundColor: (t) =>
                            t.palette.mode === 'light' ? t.palette.grey[50] : t.palette.grey[900],
                        backgroundSize: 'cover',
                        backgroundPosition: 'left',
                    }}
                />
                <Grid item xs={12} sm={8} md={5} component={Paper} elevation={6} square>
                    <Box
                        sx={{
                            my: 8,
                            mx: 4,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                        }}
                    >
                        <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
                            <LockOutlinedIcon />
                        </Avatar>
                        <Typography component="h1" variant="h5">
                            Sign in
                        </Typography>
                        <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 1 }}>
                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                id="email"
                                label="Email Address"
                                name="email"
                                autoComplete="email"
                                autoFocus
                            />
                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                name="password"
                                label="Password"
                                type="password"
                                id="password"
                                autoComplete="current-password"
                            />
                            <FormControlLabel
                                control={<Checkbox value="remember" color="primary" />}
                                label="Remember me"
                            />
                            <Button
                                type="submit"
                                fullWidth
                                variant="contained"
                                sx={{ mt: 3, mb: 2 }}
                            >
                                Sign In
                            </Button>
                            <Grid container>
                                <Grid item xs>
                                    <Link
                                        onClick={handleNavigate2}
                                        variant="body2"
                                        sx={{ cursor: 'pointer' }} // Ensure the cursor is a pointer
                                    >
                                        {"Forgot password?"}
                                    </Link>
                                </Grid>
                                <Grid item>
                                    <Link
                                        onClick={handleNavigate}
                                        variant="body2"
                                        sx={{ cursor: 'pointer' }} // Ensure the cursor is a pointer
                                    >
                                        {"Don't have an account? Sign Up"}
                                    </Link>
                                </Grid>
                            </Grid>
                            <Copyright sx={{ mt: 5 }} />
                        </Box>
                    </Box>
                </Grid>
            </Grid>
            <ToastContainer />
        </ThemeProvider>

    );
}


function Copyright(props) {
    return (
        <Typography variant="body2" color="text.secondary" align="center" {...props}>
            {'Copyright © '}
            <Link color="inherit" href="https://ecomaitech.com/home/">
                Your Website
            </Link>{' '}
            {new Date().getFullYear()}
            {'.'}
        </Typography>
    );
}