import axios from 'axios';

export const api = axios.create({
    baseURL: "http://192.168.0.109:8000",
    headers: {
        'Content-Type': 'application/json', // Ensure JSON is used for requests
    }, 
});

export const api2 = axios.create({
    baseURL: "http://192.168.1.52:8001",
    timeout: 10000,
});

// Track refresh state to prevent multiple refresh attempts
let isRefreshing = false;
let refreshPromise: Promise<string | null> | null = null;

let currentAccessToken: string | null = null;

// Function to set access token (called from AuthContext)
export const setAccessToken = (token: string | null) => {
currentAccessToken = token;

// Update axios default header immediately
if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
} else {
    delete api.defaults.headers.common['Authorization'];
}
};