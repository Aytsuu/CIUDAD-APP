import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
  useRef,
} from "react";
import { AuthContextType, User } from "./auth-types";
import { api, setAccessToken } from "@/api/api";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false);

  // ✅ keep instant reference to user
  const userRef = useRef<User | null>(null);

  const hasInitialized = useRef(false);
  const isAuthenticating = useRef(false);
  const refreshTokenRef = useRef<string | null>(null);

  const clearError = () => {
    setError(null);
  };

  const clearAuthState = useCallback(() => {
    setUser(null);
    userRef.current = null;
    setIsAuthenticated(false);
    setError(null);
    setAccessToken(null);
    refreshTokenRef.current = null;
  }, []);

  const setUserSync = (userData: User | null) => {
    setUser(userData);
    userRef.current = userData; // ✅ always in sync
  };

  const checkAuthStatus = useCallback(async () => {
    if (isAuthenticating.current) return;

    try {
      setIsLoading(true);

      const authorizationHeader = api.defaults.headers.common["Authorization"];
      const currentToken =
        typeof authorizationHeader === "string"
          ? authorizationHeader.split(" ")[1]
          : undefined;

      if (!currentToken) {
        clearAuthState();
        return;
      }

      try {
        // Validate current token
        const validateResponse = await api.post(
          "authentication/mobile/refresh/",
          { access_token: currentToken }
        );

        if (validateResponse.data.valid && validateResponse.data.user) {
          setUserSync(validateResponse.data.user);
          setIsAuthenticated(true);
          return;
        }

        // Try refresh token
        if (refreshTokenRef.current) {
          const refreshResponse = await api.post(
            "authentication/mobile/refresh-token/",
            { refresh_token: refreshTokenRef.current }
          );

          if (refreshResponse.data.user && refreshResponse.data.access_token) {
            setUserSync(refreshResponse.data.user);
            setIsAuthenticated(true);
            setAccessToken(refreshResponse.data.access_token);

            if (refreshResponse.data.refresh_token) {
              refreshTokenRef.current = refreshResponse.data.refresh_token;
            }
            return;
          }
        }

        clearAuthState();
      } catch (refreshError: any) {
        if (refreshError?.response?.status === 401) {
          clearAuthState();
          setError("Session expired - please login again");
        } else if (refreshError?.response?.status === 404) {
          clearAuthState();
          setError("Account not found - please login again");
        } else {
          setError("Network error during authentication check");
        }
      }
    } catch (error: any) {
      if (!error?.response?.status) {
        setError("Network error during authentication check");
      }
    } finally {
      setIsLoading(false);
      setHasCheckedAuth(true);
    }
  }, [clearAuthState]);

  // Initial check
  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;
    checkAuthStatus();
  }, [checkAuthStatus]);

  // Auto-refresh
  useEffect(() => {
    let refreshInterval: NodeJS.Timeout;

    if (isAuthenticated && !isLoading && user && hasCheckedAuth) {
      const refreshIntervalTime = 50 * 60 * 1000;
      refreshInterval = setInterval(() => {
        checkAuthStatus();
      }, refreshIntervalTime);
    }

    return () => {
      if (refreshInterval) clearInterval(refreshInterval);
    };
  }, [isAuthenticated, isLoading, user, hasCheckedAuth, checkAuthStatus]);

  const login = async (email: string, password: string) => {
    isAuthenticating.current = true;
    setIsLoading(true);
    clearError();

    try {
      const response = await api.post("authentication/mobile/login/", {
        email,
        password,
      });

      if (!response.data?.access_token || !response.data?.user) {
        throw new Error("Invalid response from server");
      }

      const { access_token, refresh_token, user: userData } = response.data;

      setAccessToken(access_token);
      refreshTokenRef.current = refresh_token;

      setUserSync(userData);
      setIsAuthenticated(true);
      setHasCheckedAuth(true);

      console.log("userData:", userData.acc_id);
      console.log("userRef:", userRef.current?.acc_id);

      return userData;
    } catch (error: any) {
      let message =
        error?.response?.data?.error ||
        error?.message ||
        "Login failed";
      if (error?.response?.status === 401)
        message = "Invalid email or password";
      if (error?.response?.status === 404) message = "Account not found";

      setError(message);
      clearAuthState();
      throw new Error(message);
    } finally {
      setIsLoading(false);
      isAuthenticating.current = false;
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await api.post("authentication/logout/");
    } catch {}
    finally {
      clearAuthState();
      setIsLoading(false);
      setHasCheckedAuth(false);
    }
  };

  const sendOtp = async (phoneNumber: string) => {
    setIsLoading(true);
    clearError();

    try {
      const response = await api.post("authentication/mobile/send-otp/", {
        phone_number: phoneNumber,
      });

      return {
        success: true,
        message: response.data?.message || "OTP sent successfully!",
      };
    } catch (error: any) {
      const message = error?.response?.data?.error || "Failed to send OTP";
      setError(message);
      return { success: false, message };
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOtp = async (phoneNumber: string, otp: string) => {
    isAuthenticating.current = true;
    setIsLoading(true);
    clearError();

    try {
      const response = await api.post("authentication/mobile/verify-otp/", {
        phone_number: phoneNumber,
        otp,
      });

      if (response.data?.access_token && response.data?.user) {
        const { access_token, refresh_token, user: userData } = response.data;

        setAccessToken(access_token);
        if (refresh_token) refreshTokenRef.current = refresh_token;

        setUserSync(userData);
        setIsAuthenticated(true);
        setHasCheckedAuth(true);
      }

      return response.data;
    } catch (error: any) {
      const message = error?.response?.data?.error || "OTP verification failed";
      setError(message);
      throw error;
    } finally {
      setIsLoading(false);
      isAuthenticating.current = false;
    }
  };

  const signUp = async (email: string, password: string, username?: string) => {
    isAuthenticating.current = true;
    setIsLoading(true);
    clearError();

    try {
      const response = await api.post("authentication/signup/", {
        email,
        password,
        username,
      });

      if (!response.data.requiresConfirmation &&
          response.data.user &&
          response.data.access_token) {
        const { access_token, refresh_token, user: userData } = response.data;

        setAccessToken(access_token);
        if (refresh_token) refreshTokenRef.current = refresh_token;

        setUserSync(userData);
        setIsAuthenticated(true);
        setHasCheckedAuth(true);
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
      isAuthenticating.current = false;
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
        clearError,
        verifyOtp,
        sendOtp,
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
