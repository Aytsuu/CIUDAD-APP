import { useMutation } from "@tanstack/react-query";
import { useAppDispatch } from "../redux";
import { setLoading, setError, clearAuthState, clearError, setAuthData, setOtpSent } from "./authSlice";
import { queryClient } from "@/lib/queryClient";
import { LoginCredentials, SignupCredentials, TokenResponse, SignupResponse } from "./auth-types";
import { api } from "@/api/api";

export const useLoginMutation = () => {
  const dispatch = useAppDispatch();
  
  return useMutation<TokenResponse, Error, LoginCredentials>({
    mutationFn: async (credentials) => {
      const response = await api.post('authentication/web/login/', credentials);
      console.log(response.data);
      return response.data;
    },
    onMutate: () => {
      dispatch(setLoading(true));
      dispatch(clearError());
    },
    onSuccess: (data) => {
      dispatch(setAuthData({ access: data.access, user: data.user }));
      dispatch(setLoading(false));
    },
    onError: (error: any) => {
      const message = error?.response?.data?.error || 'Login failed';
      dispatch(setError(message));
      dispatch(setLoading(false));
    },
  });
};

export const useSignupMutation = () => {
  const dispatch = useAppDispatch();
  
  return useMutation<SignupResponse, Error, SignupCredentials>({
    mutationFn: async (credentials) => {
      const response = await api.post('authentication/signup/', credentials);
      return response.data;
    },
    onMutate: () => {
      dispatch(setLoading(true));
      dispatch(clearError());
    },
    onSuccess: (data) => {
      if (data.access && data.user) {
        dispatch(setAuthData({ access: data.access, user: data.user }));
      }
      dispatch(setLoading(false));
    },
    onError: (error: any) => {
      const message = error?.response?.data?.error || 'Signup failed';
      dispatch(setError(message));
      dispatch(setLoading(false));
    },
  });
};

export const useSendEmailOTPMutation = () => {
  const dispatch = useAppDispatch();
  
  return useMutation<{ message: string }, Error, Record<string, any>>({
    mutationFn: async (data) => {
      try {
        const response = await api.post('authentication/email/sendOtp/', data);
        return response.data;
      } catch (err) {
        console.error(err)
        throw err;
      }
    },
    // onMutate: () => {
    //   dispatch(setLoading(true));
    //   dispatch(clearError());
    // },
    onSuccess: (data, email) => {
      if (data.message) {
        dispatch(setOtpSent({ sent: true, email }));
      }
      dispatch(setLoading(false));
    },
    // onError: (error: any) => {
    //   const message = error?.response?.data?.email || "Failed to send OTP";
    //   console.log(message)
    //   dispatch(setError(message));
    //   dispatch(setLoading(false));
    // },
  });
};

export const useVerifyEmailOTPMutation = () => {
  const dispatch = useAppDispatch();
  
  return useMutation({
    mutationFn: async ({ otp, email } : { otp: string, email: string}) => {
      const response = await api.post('authentication/email/verifyOtp/', {
        otp,
        email,
      });
      return response;
    },
    onMutate: () => {
      dispatch(setLoading(true));
      dispatch(clearError());
    },
    onSuccess: () => {
      // if (data.access) {
      //   dispatch(setAuthData({ access: data.access, user: data.user }));
      //   dispatch(clearOtpState());
      // }
      dispatch(setLoading(false));
    },
    onError: (error: any) => {
      const message = error?.response?.data?.error || 'OTP verification failed';
      dispatch(setError(message));
      dispatch(setLoading(false));
    },
  });
};

export const useLogoutMutation = () => {
  const dispatch = useAppDispatch();
  
  return useMutation<void, Error, void>({
    mutationFn: async () => {
      await api.post('authentication/logout/');
    },
    onMutate: () => {
      dispatch(setLoading(true));
    },
    onSettled: () => {
      dispatch(clearAuthState());
      dispatch(setLoading(false));
      
      // Clear all React Query cache on logout
      queryClient.clear();
    },
  });
};