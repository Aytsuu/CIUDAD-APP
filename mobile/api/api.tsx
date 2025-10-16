import axios from "axios";
import { setupApiInterceptor } from "./apiInterceptor";

export const api = axios.create({
  baseURL: "http://10.151.16.31:8000",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json",
  }
});

export const api2 = axios.create({
  baseURL: "http://10.151.16.31:8001",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json",
  },
});



// export const api2 = axios.create({
//   baseURL: Constants.expoConfig?.extra?.apiUrl2,
//   withCredentials: true,
//   headers: {
//     "Content-Type": "application/json",r
//     "Accept": "application/json",
//   },
// });

setupApiInterceptor(api)

export default api;