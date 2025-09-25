import axios from "axios";
import { setupApiInterceptor } from "./interceptor";


// export const api = axios.create({
//   baseURL: import.meta.env.VITE_API_URL,
//   baseURL: import.meta.env.VITE_API_URL,
//   withCredentials: true, 
//   headers: {
//     "Content-Type": "application/json",
//     "Accept": "application/json",
//   },
// });

export const api = axios.create({
  baseURL: "http://localhost:8000",
  withCredentials: true, 
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json",
  },
});

// export const api2 = axios.create({
//   baseURL: import.meta.env.VITE_API_URL2,
//   withCredentials: true,
//   headers: {
//     "Content-Type": "application/json",
//     "Accept": "application/json",
//   },
// });

export const api2 = axios.create({
  baseURL: "http://localhost:8001",
  withCredentials: true, 
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json",
  },
});

setupApiInterceptor(api)

export default api