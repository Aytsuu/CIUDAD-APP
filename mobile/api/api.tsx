import axios from "axios";
import { setupApiInterceptor } from "./apiInterceptor";
import Constants from 'expo-constants'

export const mapApi = axios.create({
  baseURL: Constants.expoConfig?.extra?.apiUrl,
})

// export const api = axios.create({
//   baseURL: "http://192.168.1.52:8000",
//   withCredentials: true,
//   headers: {
//     "Content-Type": "application/json",
//     "Accept": "application/json",
//   },
// });

export const api = axios.create({
  baseURL: "http://192.168.1.13:8000",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json",
  },
});

// export const api2 = axios.create({
//   baseURL: "http://172.31.225.66:8001",
//   timeout: 10000,
// });

export const api2 = axios.create({
  baseURL: "http://192.168.1.13:8001",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json",
  },
});

setupApiInterceptor(api)

export default api;