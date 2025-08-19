import axios from "axios";

export const api = axios.create({
  baseURL: "http://192.168.209.208:8000",
  withCredentials: true, 
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json",
  },
});

export const api2 = axios.create({
  baseURL: "http://localhost:8001",
});

// Track refresh state to prevent multiple refresh attempts
let isRefreshing = false;
let refreshPromise: Promise<string | null> | null = null;

// Simple access token storage (you could also use a more sophisticated store)
let currentAccessToken: string | null = null;

// Function to set access token (called from AuthContext)
export const setAccessToken = (token: string | null) => {
  currentAccessToken = token;
};

// Add auth token to requests
api.interceptors.request.use(
  (config) => {
    // Skip auth for public endpoints
    const publicEndpoints = [
      "authentication/signup/",
      "authentication/web/login/",
    ];
    
    const isPublicEndpoint = publicEndpoints.some(endpoint => 
      config.url?.includes(endpoint)
    );
    console.log("AccessToken value: ",currentAccessToken)
    if (!isPublicEndpoint && currentAccessToken) {
      config.headers.Authorization = `Bearer ${currentAccessToken}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);