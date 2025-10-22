import axios from "axios";
import { setupApiInterceptor } from "./apiInterceptor";

//brgy-api
export const api = axios.create({
  baseURL: "http://192.168.1.8:8000",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json",
  }
});

//health-api
export const api2 = axios.create({
  baseURL: "http://192.168.1.8:8001",
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