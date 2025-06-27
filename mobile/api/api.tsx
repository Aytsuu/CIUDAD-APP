import { supabase } from '@/lib/supabase';
import axios from 'axios';

export const api = axios.create({
    baseURL: "http://192.168.143.131:8000",
    headers: {
        'Content-Type': 'application/json', // Ensure JSON is used for requests
    },
});

export const api2 = axios.create({
  baseURL: 'http://192.168.1.8:8001',


});

api.interceptors.request.use(async (config) => {
  if (config.url?.includes('/authentication/')) return config;

  const { data: { session } } = await supabase.auth.getSession();
  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`;
  }
  return config;
});

// Essential error handling
api.interceptors.response.use(
  response => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Handle 401 errors
    if (error.response?.status === 401) {
      console.error('Authentication expired - redirecting to login');
      await supabase.auth.signOut();
      window.location.href = '/login?session_expired=true';
    }
    
    // Always reject the error to propagate it
    return Promise.reject(error);
  }
);