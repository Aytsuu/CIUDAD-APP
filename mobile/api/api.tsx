import axios from "axios";
import { supabase } from "@/lib/supabase";

export const api = axios.create({
  baseURL: "http://192.168.1.2:8000", 
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000, // 10 second timeout
});

export const api2 = axios.create({
  baseURL: "http://localhost:8001",
  timeout: 10000,
});

// Request interceptor to add auth token
api.interceptors.request.use(async (config) => {
  // Skip auth for login and signup endpoints
  if (
    config.url?.includes("authentication/login/") ||
    config.url?.includes("authentication/signup/")
  ) {
    return config;
  }

  try {
    // Get current session
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error("Error getting session:", error);
      return config;
    }
    
    if (session?.access_token) {
      config.headers.Authorization = `Bearer ${session.access_token}`;
      console.log("Added auth token to request:", config.url);
    } else {
      console.warn("No access token found in session for:", config.url);
    }
  } catch (error) {
    console.error("Error in request interceptor:", error);
  }
  
  return config;
});

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => {
    console.log("API Response:", response.config.url, response.status);
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    console.error("API Error:", originalRequest?.url, error.response?.status, error.message);

    // If we get 401 and haven't already retried
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        console.log("Attempting to refresh session...");
        
        // Try to refresh the session
        const { data, error: refreshError } = await supabase.auth.refreshSession();
        
        if (refreshError || !data.session?.access_token) {
          // Refresh failed, redirect to login
          console.error("Session refresh failed:", refreshError);
          await supabase.auth.signOut();
          
          // Navigate to login screen
          // NavigationService.navigate('Login');
          
          return Promise.reject(error);
        }

        console.log("Session refreshed successfully, retrying request...");
        
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