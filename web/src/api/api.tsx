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
  baseURL: "http://192.168.1.9:8000",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json",
  },
});

export const api2 = axios.create({
  baseURL: "http://localhost:8001",
});


// Interceptors act like middleware for api calls 


// Interceptors act like middleware for api calls 

// // Request interceptor to add auth token
// api.interceptors.request.use(async (config) => {
//   // Skip auth for login and signup endpoints
//   if (
//     config.url?.includes("authentication/login/") ||
//     config.url?.includes("authentication/signup/")
//   ) {
//     return config;
//   }

//   try {
//     // Get current session
//     const { data: { session }, error } = await supabase.auth.getSession();
    
//     if (error) {
//       console.error("Error getting session:", error);
//       return config;
//     }
    
//     if (session?.access_token) {
//       config.headers.Authorization = `Bearer ${session.access_token}`;
//     } else {
//       console.warn("No access token found in session");
//     }
//   } catch (error) {
//     console.error("Error in request interceptor:", error);
//   }
  
//   return config;
// });

// // Response interceptor to handle auth errors
// api.interceptors.response.use(
//   (response) => response,
//   async (error) => {
//     const originalRequest = error.config;

//     // If we get 401 and haven't already retried
//     if (error.response?.status === 401 && !originalRequest._retry) {
//       originalRequest._retry = true;

//       try {
//         // Try to refresh the session
//         const { data, error: refreshError } = await supabase.auth.refreshSession();
        
//         if (refreshError || !data.session?.access_token) {
//           // Refresh failed, redirect to login
//           console.error("Session refresh failed:", refreshError);
//           await supabase.auth.signOut();
//           // Redirect to login page here
//           // window.location.href = '/login';
//           return Promise.reject(error);
//         }

//         // Retry the original request with new token
//         originalRequest.headers.Authorization = `Bearer ${data.session.access_token}`;
//         return api(originalRequest);
        
//       } catch (refreshError) {
//         console.error("Error refreshing session:", refreshError);
//         await supabase.auth.signOut();
//         return Promise.reject(error);
//       }
//     }

//     return Promise.reject(error);
//   }
// );

