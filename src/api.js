import axios from 'axios';

// Base URL for your API
const BASE_URL = process.env.REACT_APP_API_URL;

const api = axios.create({
    baseURL: BASE_URL,
});

// Request interceptor to add token to headers
api.interceptors.request.use((config) => {
    // Retrieve token from local storage or any other secure storage mechanism
    const token = localStorage.getItem('authToken');
    if (token) {
        config.headers['Authorization'] = `Token ${token}`; // Use 'Token' for Django Knox
    }

    // Retrieve CSRF token from cookies and add it to the request headers
    const csrfToken = getCookie('csrftoken'); // Ensure you have a function to get the CSRF token
    if (csrfToken) {
        config.headers['X-CSRFToken'] = csrfToken; // Add CSRF token to headers
    }

    return config;
}, (error) => Promise.reject(error));

// Response interceptor to handle errors globally
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            localStorage.removeItem('authToken');
            // Implement a more robust error handling mechanism (e.g., redirect to login)
            console.error('Unauthorized request:', error.response.data);
        }
        return Promise.reject(error);
    }
);

// Function to get CSRF token from cookies
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

export default api;
