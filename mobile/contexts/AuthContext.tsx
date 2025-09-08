import { useCallback, useEffect } from "react";
import { useAppSelector, useAppDispatch } from "@/redux/redux";
import {  useLoginMutation,
  useSignupMutation,
  useSendOTPMutation,
  useVerifyOTPMutation,
  useSendEmailOTPMutation,
  useVerifyEmailOTPMutation,
  useLogoutMutation } from "@/redux/auth-redux/useAuthMutation";
import { setAuthChecked, clearOtpState, clearError } from "@/redux/auth-redux/authSlice";
import { LoginCredentials, SignupCredentials } from "@/redux/auth-redux/auth-types";
import { KeychainService } from "@/services/keychainService";

export const useAuth = () => {
  const dispatch = useAppDispatch();
  const { 
    user, 
    isAuthenticated, 
    isLoading, 
    error, 
    hasCheckedAuth, 
    otpSent, 
    email, 
    phone,
    accessToken // Access token is available in state but not used directly
  } = useAppSelector((state) => state.auth);
  
  // Mutations
  const loginMutation = useLoginMutation();
  const signupMutation = useSignupMutation();
  const sendOTPMutation = useSendOTPMutation();
  const verifyOTPMutation = useVerifyOTPMutation();
  const sendEmailOTPMutation = useSendEmailOTPMutation();
  const verifyEmailOTPMutation = useVerifyEmailOTPMutation();
  const logoutMutation = useLogoutMutation();

  // Check authentication on app startup
  useEffect(() => {
    const checkAuth = async () => {
      if (hasCheckedAuth) return;

      console.log('🔍 Checking authentication status...');
      
      try {
        const hasToken = await KeychainService.hasRefreshToken();
        
        dispatch(setAuthChecked());
      } catch (error) {
        console.error('❌ Auth check failed:', error);
        dispatch(setAuthChecked());
      }
    };

    checkAuth();
  }, [hasCheckedAuth, isAuthenticated, dispatch]);

  // Actions (matching your web implementation exactly)
  const login = useCallback(
    async (credentials: LoginCredentials) => {
      console.log('🔐 Login attempt for:', credentials.email);
      const result = await loginMutation.mutateAsync(credentials);
      return result.user;
    },
    [loginMutation]
  );

  const signUp = useCallback(
    async (credentials: SignupCredentials) => {
      console.log('📝 Signup attempt for:', credentials.email);
      const result = await signupMutation.mutateAsync(credentials);
      return {
        requiresConfirmation: result.requireConfirmation ?? false,
        user: result.user,
      };
    },
    [signupMutation]
  );

  const sendOTP = useCallback(
    async (phoneNumber: string) => {
      console.log('📱 Sending OTP to:', phoneNumber);
      try {
        await sendOTPMutation.mutateAsync(phoneNumber);
        return true;
      } catch {
        return false;
      }
    },
    [sendOTPMutation]
  );

  const verifyOTP = useCallback(
    async (phone: string, otp: string) => {
      console.log('🔐 Verifying OTP for:', phone);
      try {
        const result = await verifyOTPMutation.mutateAsync({ phone, otp });
        return result.user;
      } catch {
        return null;
      }
    },
    [verifyOTPMutation]
  );

  const sendEmailOTP = useCallback(
    async (emailAddress: string) => {
      console.log('📧 Sending Email OTP to:', emailAddress);
      try {
        await sendEmailOTPMutation.mutateAsync(emailAddress);
        return true;
      } catch {
        return false;
      }
    },
    [sendEmailOTPMutation]
  );

  const verifyEmailOTPAndLogin = useCallback(
    async (otp: string, email: string) => {
      console.log('🔐 Verifying Email OTP for:', email);
      try {
        const result = await verifyEmailOTPMutation.mutateAsync({ email, otp });
        return result.user;
      } catch {
        return null;
      }
    },
    [verifyEmailOTPMutation]
  );

  const logout = useCallback(async () => {
    console.log('🚪 Logging out user...');
    logoutMutation.mutate();
  }, [logoutMutation]);

  const clearAuthError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  const clearOtpData = useCallback(() => {
    dispatch(clearOtpState());
  }, [dispatch]);


  return {
    user,
    isAuthenticated,
    isLoading: isLoading || 
               loginMutation.isPending || 
               signupMutation.isPending ||
               sendOTPMutation.isPending || 
               verifyOTPMutation.isPending ||
               sendEmailOTPMutation.isPending || 
               verifyEmailOTPMutation.isPending || 
               logoutMutation.isPending ||
    error,
    hasCheckedAuth,
    otpSent,
    email,
    phone,
    
    login,
    signUp,
    sendOTP,
    verifyOTP,
    sendEmailOTP,
    verifyEmailOTPAndLogin,
    logout,
    clearAuthError,
    clearOtpData,
    
    loginLoading: loginMutation.isPending,
    signupLoading: signupMutation.isPending,
    otpLoading: sendOTPMutation.isPending,
    verifyOtpLoading: verifyOTPMutation.isPending,
    emailOtpLoading: sendEmailOTPMutation.isPending,
    verifyEmailOtpLoading: verifyEmailOTPMutation.isPending,
    logoutLoading: logoutMutation.isPending,
  };
};
