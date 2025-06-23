// import { api } from "@/api/api";

// export const AuthService = {
//   login: async (credentials: { usernameOrEmail: string; password: string }) => {
//     try {
//       const response = await api.post(
//         "/authentication/login/",
//         {
//           usernameOrEmail: credentials.usernameOrEmail,
//           password: credentials.password,
//         },
//         {
//           withCredentials: true,
//         }
//       );

//       // Verify the response contains the expected data
//       if (!response.data?.id) {
//         throw new Error("Authentication succeeded but user data is missing");
//       }

//       return response.data;
//     } catch (error) {
//       console.error("Login error:", error);
//       throw error;
//     }
//   },

//   logout: async () => {
//     try {
//       await api.post(
//         "/authentication/logout/",
//         {},
//         {
//           withCredentials: true,
//         }
//       );
//     } catch (error) {
//       console.error("Logout error:", error);
//       throw error;
//     }
//   },

//   refreshToken: async () => {
//     try {
//       const response = await api.post(
//         "/authentication/refresh/",
//         {},
//         {
//           withCredentials: true,
//         }
//       );
//       return response.data;
//     } catch (error) {
//       console.error("Token refresh error:", error);
//       throw error;
//     }
//   },

//   verifyAuth: async () => {
//     try {
//       const response = await api.get("/authentication/verify/", {
//         withCredentials: true,
//         headers: {
//           Accept: "application/json",
//           "Content-Type": "application/json",
//         },
//       });

//       if (!response.data?.valid) {
//         throw new Error("Authentication verification failed");
//       }

//       return response.data;
//     } catch (error: any) {
//       console.error("Auth verification failed:", error);

//       // Handle specific error cases
//       if (error.response?.status === 401) {
//         throw new Error("Session expired. Please login again.");
//       } else if (error.response?.status === 500) {
//         throw new Error("Server error during authentication verification");
//       }

//       throw new Error(
//         error.response?.data?.error || "Authentication verification failed"
//       );
//     }
//   },

//   getUser: async () => {
//     try {
//       const response = await api.get("/authentication/user/", {
//         withCredentials: true,
//       });
//       return response.data;
//     } catch (error) {
//       console.error("Get user failed:", error);
//       throw error;
//     }
//   },
// };
