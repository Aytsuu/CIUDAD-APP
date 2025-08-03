import axios from "axios";
import supabase from "@/supabase/supabase";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json",
  },
});

export const api2 = axios.create({
  baseURL: import.meta.env.VITE_API_URL2
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json",
  },
});

// // Request interceptor to add auth token
// api.interceptors.request.use(async (config) => {
//   // Skip auth for login and signup endpoints
//   if (
//     config.url?.includes("authentication/login/") ||
//     config.url?.includes("authentication/signup/")
//   ) {
//     return config;
//   }

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If we get 401 and haven't already retried
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Try to refresh the session
        const { data, error: refreshError } = await supabase.auth.refreshSession();
        
        if (refreshError || !data.session?.access_token) {
          // Refresh failed, redirect to login
          console.error("Session refresh failed:", refreshError);
          await supabase.auth.signOut();
          // Redirect to login page here
          // window.location.href = '/login';
          return Promise.reject(error);
        }

        // Retry the original request with new token
        originalRequest.headers.Authorization = `Bearer ${data.session.access_token}`;
        return api(originalRequest);
        
      } catch (refreshError) {
        console.error("Error refreshing session:", refreshError);
        await supabase.auth.signOut();
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);