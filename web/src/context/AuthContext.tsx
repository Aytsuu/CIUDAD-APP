import { useCallback } from "react";
import { useAppDispatch, useAppSelector } from "@/redux/redux";
import { clearError, clearOtpState } from "@/redux/auth-redux/authSlice";
import { useLoginMutation, useSignupMutation, useSendEmailOTPMutation, useVerifyEmailOTPMutation, useLogoutMutation } from "@/redux/auth-redux/useAuthMutation";
import { LoginCredentials, SignupCredentials } from "@/redux/auth-redux/auth-types";

export const useAuth = () => {
  const dispatch = useAppDispatch();
  const { user, isAuthenticated, isLoading, error, otpSent, email} = useAppSelector((state) => state.auth);

  // Mutations
  const loginMutation = useLoginMutation();
  const signupMutation = useSignupMutation();
  const sendOTPMutation = useSendEmailOTPMutation();
  const verifyOTPMutation = useVerifyEmailOTPMutation();
  const logoutMutation = useLogoutMutation();

  // Actions
  const login = useCallback(
    async (credentials: LoginCredentials) => {
      const result = await loginMutation.mutateAsync(credentials);
      return result.user;
    },
    [loginMutation]
  );

  const signUp = useCallback(
    async (credentials: SignupCredentials) => {
      const result = await signupMutation.mutateAsync(credentials);
      return {
        requiresConfirmation: result.requiresConfirmation ?? false,
      };
    },
    [signupMutation]
  );

  const sendEmailOTP = useCallback(
    async (emailAddress: string) => {
      try {
        await sendOTPMutation.mutateAsync(emailAddress);
        return true;
      } catch {
        return false;
      }
    },
    [sendOTPMutation]
  );

  const verifyEmailOTPAndLogin = useCallback(
    async (otp: string, email: string) => {
      try {
        const result = await verifyOTPMutation.mutateAsync({ otp, email });
        return result.user;
      } catch {
        return null;
      }
    },
    [verifyOTPMutation]
  );

  const logout = useCallback(async () => {
    logoutMutation.mutate();
  }, [logoutMutation]);

  const clearAuthError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  const clearOtpData = useCallback(() => {
    dispatch(clearOtpState());
  }, [dispatch]);

  return {
    // State
    user,
    isAuthenticated,
    isLoading: isLoading || loginMutation.isPending || signupMutation.isPending || 
              sendOTPMutation.isPending || verifyOTPMutation.isPending || logoutMutation.isPending,
    error,
    otpSent,
    email,
    
    // Actions
    login,
    signUp,
    sendEmailOTP,
    verifyEmailOTPAndLogin,
    logout,
    clearAuthError,
    clearOtpData,
    
    // Mutation states for granular loading
    loginLoading: loginMutation.isPending,
    signupLoading: signupMutation.isPending,
    otpLoading: sendOTPMutation.isPending,
    verifyOtpLoading: verifyOTPMutation.isPending,
    logoutLoading: logoutMutation.isPending,
  };
};