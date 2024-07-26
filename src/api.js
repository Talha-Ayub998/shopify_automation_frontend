import axios from 'axios';



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

export default api;
