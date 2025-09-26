import axios from "axios";
import { setupApiInterceptor } from "./apiInterceptor";
import Constants from 'expo-constants'

export const api = axios.create({
  baseURL: "http://192.168.1.6:8000", 
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json",
  },
});
export const api2 = axios.create({
  baseURL: "http://192.168.1.6:8001",
  timeout: 10000,
  headers: {
    Apikey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1pb3JuaGN4eHp4ZWN3bmtndXBxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIzNjQ4MDgsImV4cCI6MjA1Nzk0MDgwOH0.3N-rpVcVmy75JvrvcVV3CRlXCMDNqv5RRDIxf_fUDWQ',
    'Content-Type': 'application/json',
    "Accept": "application/json",
  },
});

// export const api2 = axios.create({
//   baseURL: Constants.expoConfig?.extra?.apiUrl2,
//   withCredentials: true,
//   headers: {
//     "Content-Type": "application/json",
//     "Accept": "application/json",
//   },
// });

setupApiInterceptor(api)

export default api;