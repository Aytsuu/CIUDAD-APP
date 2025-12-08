import axios from "axios";
import { setupApiInterceptor } from "./interceptor";

export const mapApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true, 
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json",
  },
});

// export const api = axios.create({
//   baseURL: "http://localhost:8000",
//   withCredentials: true, 
//   headers: {
//     "Content-Type": "application/json",
//     "Accept": "application/json",
//   },
// });

<<<<<<< HEAD



// export const api2 = axios.create({
//   baseURL: import.meta.env.VITE_API_URL2,
//   withCredentials: true,
//   headers: {
//     "Content-Type": "application/json",
//     "Accept": "application/json",
//   },
// });

=======
>>>>>>> 9c1471cb11be057477934589e5e51c8a219b6abd
export const api2 = axios.create({
  baseURL: "http://localhost:8001",
  withCredentials: true, 
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json",
  },
});

<<<<<<< HEAD

=======
// export const api2 = axios.create({
//   baseURL: "http://localhost:8001",
//   withCredentials: true, 
//   headers: {
//     "Content-Type": "application/json",
//     "Accept": "application/json",
//   },
// });
>>>>>>> 9c1471cb11be057477934589e5e51c8a219b6abd

setupApiInterceptor(api)

export default api