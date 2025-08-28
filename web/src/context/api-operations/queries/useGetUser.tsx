// import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
// import { api, setAccessToken } from "@/api/api";
// import supabase from "@/supabase/supabase";

// // ---- Fetch Current User ----
// const fetchUser = async (): Promise<User> => {
//   const response = await api.get("authentication/web/user/");
//   return response.data.user;
// };

// export const useAuthUser = () => {
//   return useQuery<User>({
//     queryKey: ["authUser"],
//     queryFn: fetchUser,
//     staleTime: 1000 * 60 * 10, // 10 minutes
//     retry: false,
//     refetchOnWindowFocus: false,
//   });
// };

// // ---- Login ----
// export const useLogin = () => {
//   const queryClient = useQueryClient();
//   return useMutation({
//     mutationFn: async ({ email, password }: { email: string; password: string }) => {
//       const response = await api.post("authentication/web/login/", { email, password });
//       const { access_token, user } = response.data;
//       setAccessToken(access_token);
//       return user;
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ["authUser"] });
//     },
//   });
// };

// // ---- Signup ----
// export const useSignUp = () => {
//   const queryClient = useQueryClient();
//   return useMutation({
//     mutationFn: async ({ email, password, username }: { email: string; password: string; username?: string }) => {
//       const response = await api.post("authentication/signup/", { email, password, username });
//       if (response.data.user) {
//         const { access_token } = response.data;
//         setAccessToken(access_token);
//       }
//       return response.data;
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ["authUser"] });
//     },
//   });
// };

// // ---- Send OTP ----
// export const useSendEmailOTP = () => {
//   return useMutation({
//     mutationFn: async (email: string) => {
//       const response = await api.post("authentication/email/sendOtp/", { email });
//       return response.data;
//     },
//   });
// };

// // ---- Verify OTP ----
// export const useVerifyEmailOTP = () => {
//   const queryClient = useQueryClient();
//   return useMutation({
//     mutationFn: async ({ otp, email }: { otp: string; email: string }) => {
//       const response = await api.post("authentication/email/verifyOtp/", { otp, email });
//       const { access_token, user } = response.data;
//       setAccessToken(access_token);
//       return user;
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ["authUser"] });
//     },
//   });
// };

// // ---- Google Login ----
// export const useLoginWithGoogle = () => {
//   return useMutation({
//     mutationFn: async () => {
//       const { error } = await supabase.auth.signInWithOAuth({
//         provider: "google",
//         options: {
//           redirectTo: `${window.location.origin}/home`,
//           queryParams: { access_type: "offline", prompt: "consent" },
//         },
//       });
//       if (error) throw error;
//       return true;
//     },
//   });
// };

// // ---- Logout ----
// export const useLogout = () => {
//   const queryClient = useQueryClient();
//   return useMutation({
//     mutationFn: async () => {
//       await api.post("authentication/logout/");
//       await supabase.auth.signOut();
//       setAccessToken(null);
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ["authUser"] });
//     },
//   });
// };


import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, setAccessToken } from "@/api/api";
import supabase from "@/supabase/supabase";
import { User } from "@/context/auth-types";

// Fetch current user
const fetchUser = async (): Promise<User | null> => {
  try {
    const response = await api.get("authentication/web/user/");
    return response.data.user ?? null;
  } catch {
    return null;
  }
};

// Login mutation
const loginUser = async ({ email, password }: { email: string; password: string }) => {
  const response = await api.post("authentication/web/login/", { email, password });
  const { access_token, user } = response.data;
  setAccessToken(access_token);
  localStorage.setItem("access_token", access_token);
  return { access_token, user };
};

// Logout mutation
const logoutUser = async () => {
  await api.post("authentication/logout/");
  await supabase.auth.signOut();
  localStorage.removeItem("access_token");
};

// Signup mutation
const signupUser = async ({
  email,
  password,
  username,
}: {
  email: string;
  password: string;
  username?: string;
}) => {
  const response = await api.post("authentication/signup/", { email, password, username });
  return response.data;
};

// Send OTP mutation
const sendOtp = async (email: string) => {
  const response = await api.post("authentication/email/sendOtp/", { email });
  return response.data;
};

// Verify OTP mutation
const verifyOtp = async ({ email, otp }: { email: string; otp: string }) => {
  const response = await api.post("authentication/email/verifyOtp/", { email, otp });
  return response.data;
};

// Google login via Supabase
const loginWithGoogle = async () => {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${window.location.origin}/home`,
      queryParams: { access_type: "offline", prompt: "consent" },
    },
  });
  if (error) throw error;
};

// React Query hooks
export const useAuthUser = () => {
  return useQuery<User | null>({
    queryKey: ["authUser"],
    queryFn: fetchUser,
    staleTime: 1000 * 60 * 5, // cache for 5 mins
  });
};

export const useLogin = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: loginUser,
    onSuccess: ({ user }) => {
      queryClient.setQueryData(["authUser"], user);
    },
  });
};

export const useLogout = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: logoutUser,
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: ["authUser"] });
    },
  });
};

export const useSignup = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: signupUser,
    onSuccess: (data) => {
      if (data.user) {
        queryClient.setQueryData(["authUser"], data.user);
      }
    },
  });
};

export const useSendOtp = () => {
  return useMutation({ mutationFn: sendOtp });
};

export const useVerifyOtp = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: verifyOtp,
    onSuccess: (data) => {
      if (data.user) {
        queryClient.setQueryData(["authUser"], data.user);
      }
    },
  });
};

export const useGoogleLogin = () => {
  return useMutation({ mutationFn: loginWithGoogle });
};
