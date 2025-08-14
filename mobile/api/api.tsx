import axios from "axios";
import { supabase } from "@/lib/supabase";

export const api = axios.create({
  baseURL: "http://192.168.1.52:8000",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json",
  },
});

export const api2 = axios.create({
  baseURL: "http://192.168.1.52:8001",
  timeout: 10000,
});


// // Request interceptor to add auth token
// api.interceptors.request.use(async (config) => {
//   // Define unprotected paths
//   const unprotectedPaths = [
//     "/authentication/mobile/login/",
//     "/authentication/signup/",
//     "/profiling/kyc/match-document/"
//   ];

//   const requestPath = new URL(config.url!, api.defaults.baseURL).pathname;

//   if (unprotectedPaths.includes(requestPath)) {
//     console.log("Skipping token for:", requestPath);
//     return config;
//   }

//   try {
//     const { data: { session }, error } = await supabase.auth.getSession();

//     if (error) {
//       console.error("Error getting session:", error);
//       return config;
//     }

//     if (session?.access_token) {
//       config.headers.Authorization = `Bearer ${session.access_token}`;
//       console.log("✅ Added auth token to request:", requestPath);
//     } else {
//       console.warn("⚠️ No access token found in session for:", requestPath);
//     }
//   } catch (err) {
//     console.error("Error in request interceptor:", err);
//   }
  
//   return config;
// });