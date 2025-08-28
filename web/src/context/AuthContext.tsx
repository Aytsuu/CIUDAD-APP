import {
  createContext,
  useContext,
  useState,
  useLayoutEffect,
  ReactNode,
  useCallback,
  useEffect,
} from "react";
import { AuthContextType, User } from "./auth-types";
import { api, setAccessToken } from "@/api/api";
import supabase from "@/supabase/supabase";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentAccessToken, setCurrentAccessToken] = useState<string | null>(null);

  // Email OTP state
  const [otpSent, setOtpSent] = useState<boolean>(false);
  const [otpToken, setOtpToken] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);

  // Send OTP to email
  const sendEmailOTP = async (emailAddress: string) => {
    setIsLoading(true);
    clearError();
    try {
      const response = await api.post("authentication/email/sendOtp/", {
        email: emailAddress,
      });
      if (response.data.message) {
        setOtpSent(true);
        setEmail(emailAddress);
        return true;
      } else {
        setError("Failed to send OTP");
        return false;
      }
    } catch (error: any) {
      setError(error?.response?.data?.error || "Failed to send OTP");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Verify OTP and login
  const verifyEmailOTPAndLogin = async (otp: string, email: string) => {
    setIsLoading(true);
    clearError();
    try {
      const response = await api.post("authentication/email/verifyOtp/", {
        otp,
        email
      });
      if (response.data.success) {
        setCurrentAccessToken(response.data.access_token);
        setAccessToken(response.data.access_token);
        localStorage.setItem("access_token", response.data.access_token);
        setUser(response.data.user);
        setIsAuthenticated(true);
        setOtpSent(false);
        setOtpToken(null);
        setEmail(null);
        console.log("Successfully matched")
        return response.data.user;
      } else {
        setError("Invalid OTP or login failed");
        return null;
      }
    } catch (error: any) {
      setError(error?.response?.data?.error || "OTP verification failed");
      return null;
    } finally {
      setIsLoading(false);
    }
  };



  const clearError = () => setError(null);

  const clearAuthState = useCallback(() => {
    setUser(null);
    setIsAuthenticated(false);
    setCurrentAccessToken(null);
    setError(null);
    setAccessToken(null);
    // Clear OTP states
    setOtpSent(false);
    setOtpToken(null);
    setEmail(null);
  }, []);

  // Listen for Supabase auth state changes
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Supabase auth event:", event);
      
      if (event === 'SIGNED_IN' && session?.user) {
        const supabaseUser = session.user;
        console.log("Supabase user signed in:", supabaseUser);
        
        // Process Google login
        if (supabaseUser.app_metadata?.provider === 'google') {
          try {
            await processGoogleLogin(supabaseUser);
          } catch (error) {
            console.error("Error processing Google login:", error);
            setError(error instanceof Error ? error.message : "Google login failed");
          }
        }
      } else if (event === 'SIGNED_OUT') {
        console.log("User signed out from Supabase");
        clearAuthState();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Process Google login with Supabase user data
  const processGoogleLogin = async (supabaseUser: any) => {
    setIsLoading(true);
    clearError();

    try {
      const userEmail = supabaseUser.email;
      const googleData = {
        email: userEmail,
        name: supabaseUser.user_metadata?.full_name || supabaseUser.user_metadata?.name,
        picture: supabaseUser.user_metadata?.avatar_url || supabaseUser.user_metadata?.picture,
        google_id: supabaseUser.user_metadata?.sub,
        verified_email: supabaseUser.user_metadata?.email_verified,
      };

      console.log("Processing Google login for:", userEmail);
      console.log("Google user data:", googleData);

      // Check if Google account exists in your account table
      const accountResponse = await api.get("authentication/google/", userEmail);

      if (!accountResponse.data.exists) {
        throw new Error(
          "Google account not registered. Please contact administrator."
        );
      }
      console.log("Google user sheesh:", accountResponse.data);

      // Get Supabase session token
      const { data: sessionData } = await supabase.auth.getSession();
      const supabaseToken = sessionData?.session?.access_token;

      if (!supabaseToken) {
        throw new Error("No Supabase session token available");
      }

      const { access_token, user } = accountResponse.data;

      // Set authentication state
      setCurrentAccessToken(access_token);
      setAccessToken(access_token);
      localStorage.setItem("access_token", access_token);
      setUser(user);
      setIsAuthenticated(true);

      console.log("Google login successful");
      return user;
    } catch (error: any) {
      console.error("Google login processing error:", error);
      const message =
        error?.response?.data?.error ||
        error?.message ||
        "Google authentication failed";
      setError(message);
      
      // Sign out from Supabase if login failed
      await supabase.auth.signOut();
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  };

  // Main authentication check with built-in token refresh
  const checkAuthStatus = useCallback(async () => {
    try {
      setIsLoading(true);
      console.log("Checking authentication status...");

      // First try with current token
      try {
        const response = await api.get("authentication/web/user/");
        if (response.data.user) {
          setUser(response.data.user);
          setIsAuthenticated(true);
          console.log("User authenticated successfully");
          return;
        }
      } catch (initialError) {
        console.log("Initial check failed, attempting token refresh...");
      }

      console.log("Authentication check failed");
      clearAuthState();
    } catch (error: any) {
      console.error("Authentication error:", error);
      clearAuthState();

      if (error?.response?.status === 401) {
        setError("Session expired - please login again");
      } else {
        setError(error?.message || "Authentication failed");
      }
    } finally {
      setIsLoading(false);
    }
  }, [clearAuthState]);

  // Automatic token refresh
  // useLayoutEffect(() => {
  //   let refreshInterval: NodeJS.Timeout;

  //   if (isAuthenticated && !isLoading) {
  //     const refreshIntervalTime = 50 * 60 * 1000; // 50 minutes
  //     console.log("Setting up auto-refresh every 50 minutes");

  //     refreshInterval = setInterval(() => {
  //       console.log("Auto-refreshing token...");
  //       checkAuthStatus();
  //     }, refreshIntervalTime);
  //   }

  //   return () => {
  //     if (refreshInterval) clearInterval(refreshInterval);
  //   };
  // }, [isAuthenticated, isLoading, checkAuthStatus]);

  // Initial auth check on mount
  useLayoutEffect(() => {
    // Check for stored token first
    const storedToken = localStorage.getItem("access_token");
    if (storedToken) {
      setCurrentAccessToken(storedToken);
      setAccessToken(storedToken);
    }

    checkAuthStatus();
  }, [checkAuthStatus]);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    clearError();

    try {
      console.log("Attempting login for:", email);
      const response = await api.post("authentication/web/login/", {
        email,
        password,
      });

      const { access_token, user } = response.data;
      setCurrentAccessToken(access_token);
      setAccessToken(access_token);
      localStorage.setItem("access_token", access_token);
      setUser(user);
      setIsAuthenticated(true);

      console.log("Login successful");
      return user;
    } catch (error: any) {
      console.error("Login error:", error);
      const message =
        error?.response?.data?.error || error?.message || "Login failed";
      setError(message);
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  };

  // Google OAuth login - simplified
  const loginWithGoogle = async () => {
    setIsLoading(true);
    clearError();

    try {
      console.log("Initiating Google OAuth login...");
      
      // Trigger Google OAuth login
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/home`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      });

      if (error) throw error;

      console.log("Google OAuth initiated successfully");
    } catch (error: any) {
      console.error("Google OAuth initiation error:", error);
      setError(error?.message || "Failed to initiate Google login");
      setIsLoading(false);
    }
  };

  // Legacy method - kept for backward compatibility but now uses the auth state listener
  const handleGoogleCallback = async () => {
    console.log("handleGoogleCallback called - processing via auth state listener");
    // The actual processing is now handled by the auth state change listener
    // This method is kept for compatibility but doesn't need to do much
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      // Logout from your backend
      await api.post("authentication/logout/");
      
      // Logout from Supabase
      await supabase.auth.signOut();
      
      console.log("Logout successful");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      clearAuthState();
      localStorage.removeItem("access_token");
      setIsLoading(false);
    }
  };

  const signUp = async (
    email: string,
    password: string,
    username?: string
  ): Promise<{ requiresConfirmation?: boolean }> => {
    setIsLoading(true);
    clearError();

    try {
      const response = await api.post("authentication/signup/", {
        email,
        password,
        username,
      });

      if (!response.data.requiresConfirmation && response.data.user) {
        const { access_token, user } = response.data;
        setCurrentAccessToken(access_token);
        setAccessToken(access_token);
        localStorage.setItem("access_token", access_token);
        setUser(user);
        setIsAuthenticated(true);
      }

      return {
        requiresConfirmation: response.data?.requiresConfirmation ?? false,
      };
    } catch (error: any) {
      const message = error.response?.data?.error || "Signup failed";
      setError(message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        error,
        login,
        logout,
        signUp,
        refreshSession: checkAuthStatus,
        // clearError,
        // Email OTP methods
        sendEmailOTP,
        verifyEmailOTPAndLogin,
        otpSent,
        email,
        // Google methods
        loginWithGoogle,
        handleGoogleCallback,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};


// import { createContext, useContext, ReactNode } from "react";
// import {
//   useAuthUser,
//   useLogin,
//   useLogout,
//   useSignup,
//   useSendOtp,
//   useVerifyOtp,
//   useGoogleLogin,
// } from "./api-operations/queries/useGetUser";
// import { AuthContextType } from "./auth-types";

// const AuthContext = createContext<AuthContextType | undefined>(undefined);

// export const AuthProvider = ({ children }: { children: ReactNode }) => {
//   const { data: user, isLoading, error } = useAuthUser();
//   const login = useLogin();
//   const logout = useLogout();
//   const signUp = useSignup();
//   const sendEmailOTP = useSendOtp();
//   const verifyEmailOTPAndLogin = useVerifyOtp();
//   const loginWithGoogle = useGoogleLogin();

//   const value: AuthContextType = {
//     user: user ?? null,
//     isAuthenticated: !!user,
//     isLoading,
//     error: error ? String(error) : null,
//     login: async (email, password) => {
//       await login.mutateAsync({ email, password });
//     },
//     logout: () => logout.mutateAsync(),
//     signUp: (email, password, username) => signUp.mutateAsync({ email, password, username }),
//     refreshSession: async () => {},
//     sendEmailOTP: (email) => sendEmailOTP.mutateAsync(email),
//     verifyEmailOTPAndLogin: (otp, email) => verifyEmailOTPAndLogin.mutateAsync({ otp, email }),
//     otpSent: sendEmailOTP.isSuccess,
//     email: null,
//     loginWithGoogle: () => loginWithGoogle.mutateAsync(),
//     handleGoogleCallback: async () => {
//       console.log("Handled by Supabase state change");
//     },
//   };

//   return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
// };

// export const useAuth = () => {
//   const context = useContext(AuthContext);
//   if (!context) throw new Error("useAuth must be used within AuthProvider");
//   return context;
// };
