import { useMutation } from "@tanstack/react-query";
import {useAppDispatch} from "@/redux/redux";
import { setLoading, setError, clearAuthState, clearError, setAuthData, setOtpSent } from "./authSlice";
import { queryClient } from "@/lib/queryClient";
import { api } from "@/api/api";
import { LoginCredentials, SignupCredentials, TokenResponse, SignupResponse, EmailOTPCredentials } from "./auth-types";

export const useLoginMutation = () => {
  const dispatch = useAppDispatch();
  
  return useMutation<TokenResponse, Error, LoginCredentials>({
    mutationFn: async (credentials) => {
      console.log('🔐 Attempting login...');
      const response = await api.post('authentication/mobile/login/', credentials);
      console.log('✅ Login successful');
      return response.data;
    },
    onMutate: () => {
      dispatch(setLoading(true));
      dispatch(clearError());
    },
    onSuccess: (data) => {
      dispatch(setAuthData({ 
        accessToken: data.access_token, 
        user: data.user,
        refreshToken: data.refresh 
      }));
      dispatch(setLoading(false));
    },
    onError: (error: any) => {
      const message = error?.response?.data?.error || 'Login failed';
      console.error('❌ Login failed:', message);
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
      console.log('✅ Signup successful');
      return response.data;
    },
    onMutate: () => {
      dispatch(setLoading(true));
      dispatch(clearError());
    },
    onSuccess: (data) => {
      if (data.access_token && data.user) {
        dispatch(setAuthData({ 
          accessToken: data.access_token, 
          user: data.user,
          refreshToken: data.refresh_token
        }));
      }
      dispatch(setLoading(false));
    },
    onError: (error: any) => {
      const message = error?.response?.data?.error || 'Signup failed';
      console.error('❌ Signup failed:', message);
      dispatch(setError(message));
      dispatch(setLoading(false));
    },
  });
};

export const useSendEmailOTPMutation = () => {
  const dispatch = useAppDispatch();
  
  return useMutation<{ message: string }, Error, Record<string, any>>({
    mutationFn: async (data) => {
      const response = await api.post('authentication/email/sendOtp/', data);
      return response.data;
    },
    onMutate: () => {
      dispatch(setLoading(true));
      dispatch(clearError());
    },
    onSuccess: (data, email) => {
      dispatch(setOtpSent({ sent: true, email }));
      dispatch(setLoading(false));
    },
    onError: (error: any) => {
      const message = error?.response?.data?.error || 'Failed to send Email OTP';
      console.error('❌ Send Email OTP failed:', message);
      dispatch(setError(message));
      dispatch(setLoading(false));
    },
  });
};

export const useVerifyEmailOTPMutation = () => {
  const dispatch = useAppDispatch();
  
  return useMutation<TokenResponse, Error, EmailOTPCredentials>({
    mutationFn: async ({ email, otp }) => {
      console.log('🔐 Verifying Email OTP...');
      const response = await api.post('authentication/email/verifyOtp/', {
        email,
        otp,
      });
      console.log('✅ Email OTP verification successful');
      return response.data;
    },
    onMutate: () => {
      dispatch(setLoading(true));
      dispatch(clearError());
    },
    onSuccess: (data) => {
      // if (data.access_token && data.user) {
      //   dispatch(setAuthData({ 
      //     accessToken: data.access_token, 
      //     user: data.user,
      //     refreshToken: data.refresh_token 
      //   }));
      //   dispatch(clearOtpState());
      // }
      dispatch(setLoading(false));
    },
    onError: (error: any) => {
      const message = error?.response?.data?.error || 'Email OTP verification failed';
      console.error('❌ Email OTP verification failed:', message);
      dispatch(setError(message));
      dispatch(setLoading(false));
    },
  });
};

export const useLogoutMutation = () => {
  const dispatch = useAppDispatch();
  
  return useMutation<void, Error, void>({
    mutationFn: async () => {
      try {
        await api.post('authentication/logout/');
        console.log('✅ Server logout successful');
      } catch (error) {
        console.warn('⚠️ Server logout failed, continuing with local logout:', error);
      }
    },
    onMutate: () => {
      dispatch(setLoading(true));
    },
    onSettled: () => {
      dispatch(clearAuthState());
      dispatch(setLoading(false));
      queryClient.clear();
    },
  });
};