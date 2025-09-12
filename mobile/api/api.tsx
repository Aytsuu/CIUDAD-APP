import axios from "axios";
import { setupApiInterceptor } from "./apiInterceptor";

export const api = axios.create({
  baseURL: "http://192.168.1.233:8000",
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

setupApiInterceptor(api)

export default api;
