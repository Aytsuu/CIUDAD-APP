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
      console.log("Email data to be sent: ", data)
      const response = await api.post('authentication/email/sendOtp/', data);
      return response.data;
    },
    onMutate: () => {
      dispatch(setLoading(true));
      dispatch(clearError());
    },
    onSuccess: (data, email) => {
      if (data.message) {
        dispatch(setOtpSent({ sent: true, email }));
      }
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