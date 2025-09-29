import { useCallback, useEffect, useState } from "react";
import { useAppSelector, useAppDispatch } from "@/redux/redux";
import { useLoginMutation, useSignupMutation, useSendEmailOTPMutation, useVerifyEmailOTPMutation, useLogoutMutation } from "@/redux/auth-redux/useAuthMutation";
import { setAuthChecked, clearOtpState, clearError } from "@/redux/auth-redux/authSlice";
import { LoginCredentials, SignupCredentials } from "@/redux/auth-redux/auth-types";
import { KeychainService } from "@/services/keychainService";
import { usePatientByResidentId } from "@/screens/health/patientchecker/queries";

export const useAuth = () => {
  const dispatch = useAppDispatch();
  const { user, isAuthenticated, isLoading, error, hasCheckedAuth, otpSent, email, phone, accessToken } = useAppSelector((state) => state.auth);

  const [pat_id, setPatId] = useState<string | null>("PR20030001");
  // Mutations
  const loginMutation = useLoginMutation();
  const signupMutation = useSignupMutation();
  const sendEmailOTPMutation = useSendEmailOTPMutation();
  const verifyEmailOTPMutation = useVerifyEmailOTPMutation();
  const logoutMutation = useLogoutMutation();
  const { data: patientData, error: patientError } = usePatientByResidentId(user?.rp || "");

  useEffect(() => {
    if (user && patientData?.pat_id) {
      console.log("User is associated with patient ID:", patientData.pat_id);
      setPatId(patientData.pat_id);
    } else if (patientError || null) {
      console.error("Error fetching patient data:", patientError);
      setPatId("PR20030001");
    } else {
      console.log("No patient ID associated with user.");
      setPatId("PR20030001");
    }
  }, [user, patientData, patientError]);

  useEffect(() => {
    const checkAuth = async () => {
      if (hasCheckedAuth) return;

      console.log("🔍 Checking authentication status...");

      try {
        const hasToken = await KeychainService.hasRefreshToken();

        dispatch(setAuthChecked());
      } catch (error) {
        console.error("❌ Auth check failed:", error);
        dispatch(setAuthChecked());
      }
    };

    checkAuth();
  }, [hasCheckedAuth, isAuthenticated, dispatch]);

  const login = useCallback(
    async (credentials: LoginCredentials) => {
      console.log("🔐 Login attempt for:", credentials.email);
      const result = await loginMutation.mutateAsync(credentials);
      return result.user;
    },
    [loginMutation]
  );

  const signUp = useCallback(
    async (credentials: SignupCredentials) => {
      console.log("📝 Signup attempt for:", credentials.email);
      const result = await signupMutation.mutateAsync(credentials);
      return {
        requiresConfirmation: result.requireConfirmation ?? false,
        user: result.user
      };
    },
    [signupMutation]
  );

  const sendEmailOTP = useCallback(
    async (data: Record<string, any>) => {
      try {
        await sendEmailOTPMutation.mutateAsync(data);
        return true;
      } catch (err) {
        throw err;
      }
    },
    [sendEmailOTPMutation]
  );

  const verifyEmailOTP = useCallback(
    async (email: string, otp: string) => {
      console.log("🔐 Verifying Email OTP for:", email);
      try {
        const result = await verifyEmailOTPMutation.mutateAsync({ email, otp });
        return result;
      } catch {
        return null;
      }
    },
    [verifyEmailOTPMutation]
  );

  const logout = useCallback(async () => {
    console.log("🚪 Logging out user...");
    logoutMutation.mutate();
  }, [logoutMutation]);

  const clearAuthError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  const clearOtpData = useCallback(() => {
    dispatch(clearOtpState());
  }, [dispatch]);

  return {
    pat_id,
    user,
    isAuthenticated,
    isLoading: isLoading || loginMutation.isPending || signupMutation.isPending || sendEmailOTPMutation.isPending || verifyEmailOTPMutation.isPending || logoutMutation.isPending || error,
    hasCheckedAuth,
    otpSent,
    email,
    phone,

    login,
    signUp,
    sendEmailOTP,
    verifyEmailOTP,
    logout,
    clearAuthError,
    clearOtpData,

    loginLoading: loginMutation.isPending,
    signupLoading: signupMutation.isPending,
    emailOtpLoading: sendEmailOTPMutation.isPending,
    verifyEmailOtpLoading: verifyEmailOTPMutation.isPending,
    logoutLoading: logoutMutation.isPending
  };
};
