import axios from "axios";
import { setupApiInterceptor } from "./interceptor";

// export const api = axios.create({
//   baseURL: import.meta.env.VITE_API_URL,
//   withCredentials: true,
//   headers: {
//     "Content-Type": "application/json",
//     Accept: "application/json"
//   }
// });

// export const api2 = axios.create({
//   baseURL: import.meta.env.VITE_API_URL2,
//   withCredentials: true,
//   headers: {
//     "Content-Type": "application/json",
//     "Accept": "application/json",
//   },
// });

export const api = axios.create({
  baseURL: "http://localhost:8000"
});

export const api2 = axios.create({
  baseURL: "http://localhost:8001",
});


setupApiInterceptor(api);

// let isRefreshing = false;
// let refreshPromise: Promise<string | null> | null = null;

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
    const publicEndpoints = ["authentication/signup/", "authentication/web/login/"];

    const isPublicEndpoint = publicEndpoints.some((endpoint) => config.url?.includes(endpoint));
    console.log("AccessToken value: ", currentAccessToken);
    if (!isPublicEndpoint && currentAccessToken) {
      config.headers.Authorization = `Bearer ${currentAccessToken}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);
