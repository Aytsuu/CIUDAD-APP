import axios from "axios";
import supabase from "@/supabase/supabase";

// export const api = axios.create({
//   baseURL: "http://localhost:8000",
//   withCredentials: true,
//   headers: {
//     "Content-Type": "application/json",
//     "Accept": "application/json",
//   },
// });

export const api = axios.create({
  baseURL: "http://192.168.209.208:8000",
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json",
  },
});

export const api2 = axios.create({
  baseURL: "http://localhost:8001",
});

// Add auth token to requests
api.interceptors.request.use(async (config) => {
  // Skip auth for public endpoints
  if (config.url?.includes("authentication/signup/") || 
      config.url?.includes("authentication/web/login/")) {
    return config;
  }

  const { data: { session } } = await supabase.auth.getSession();
  
  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`;
  }

  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401 && !error.config._retry) {
      error.config._retry = true;
      
      const { data } = await supabase.auth.refreshSession();
      
      if (data.session?.access_token) {
        error.config.headers.Authorization = `Bearer ${data.session.access_token}`;
        return api(error.config);
      } else {
        await supabase.auth.signOut();
      }
    }
    
    return Promise.reject(error);
  }
);