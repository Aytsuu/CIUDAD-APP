import axios from "axios";
import { supabase } from "@/lib/supabase";

export const api = axios.create({
    baseURL: "http://192.168.0.109:8000",
    headers: {
        'Content-Type': 'application/json', // Ensure JSON is used for requests
    }, 
});

// export const api2 = axios.create({
//   baseURL: "http://localhost:8001/api", // Update this to your actual backend URL
//   headers: {
//     "Content-Type": "application/json",
//   },
// })

// Add request interceptor for authentication if needed
api.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = null // Get from AsyncStorage or your auth context
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

export default api;
