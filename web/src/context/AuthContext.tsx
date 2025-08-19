import {
  createContext,
  useContext,
  useState,
  useLayoutEffect,
  ReactNode,
  useCallback,
} from "react";
import { AuthContextType, User } from "./auth-types";
import { api, setAccessToken } from "@/api/api";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentAccessToken, setCurrentAccessToken] = useState<string | null>(null);

  const clearError = () => setError(null);
  
  const clearAuthState = useCallback(() => {
    setUser(null);
    setIsAuthenticated(false);
    setCurrentAccessToken(null);
    setError(null);
    setAccessToken(null);
  }, []);

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

      // If initial check fails, try refreshing token
      const refreshResponse = await api.post('authentication/refresh/');
      if (refreshResponse.data.access_token) {
        const newToken = refreshResponse.data.access_token;
        setCurrentAccessToken(newToken);
        setAccessToken(newToken);
        localStorage.setItem('access_token', newToken);

        // Retry with new token
        const retryResponse = await api.get("authentication/web/user/");
        if (retryResponse.data.user) {
          setUser(retryResponse.data.user);
          setIsAuthenticated(true);
          console.log("User authenticated after token refresh");
          return;
        }
      }

      // If all attempts fail
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
  useLayoutEffect(() => {
    let refreshInterval: NodeJS.Timeout;
    
    if (isAuthenticated && !isLoading) {
      const refreshIntervalTime = 50 * 60 * 1000; // 50 minutes
      console.log("Setting up auto-refresh every 50 minutes");
      
      refreshInterval = setInterval(() => {
        console.log("Auto-refreshing token...");
        checkAuthStatus();
      }, refreshIntervalTime);
    }
    
    return () => {
      if (refreshInterval) clearInterval(refreshInterval);
    };
  }, [isAuthenticated, isLoading, checkAuthStatus]);

  // Initial auth check on mount
  useLayoutEffect(() => {
    // Check for stored token first
    const storedToken = localStorage.getItem('access_token');
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
      const response = await api.post('authentication/web/login/', { 
        email, 
        password 
      });

      const { access_token, user } = response.data;
      setCurrentAccessToken(access_token);
      setAccessToken(access_token);
      localStorage.setItem('access_token', access_token);
      setUser(user);
      setIsAuthenticated(true);
      
      console.log("Login successful");
      
      // Log position information if available
      if (user?.staff?.assignments) {
        user.staff.assignments.forEach((assignment: any, index: number) => {
          console.log(`Position ${index + 1}:`, assignment.pos?.pos_title);
        });
      }
      
      return user;
    } catch (error: any) {
      console.error("Login error:", error);
      const message = error?.response?.data?.error || error?.message || 'Login failed';
      setError(message);
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await api.post('authentication/logout/');
      console.log("Logout successful");
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      clearAuthState();
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
      const response = await api.post('authentication/signup/', {
        email, 
        password,
        username,
      });

      if (!response.data.requiresConfirmation && response.data.user) {
        const { access_token, user } = response.data;
        setCurrentAccessToken(access_token);
        setAccessToken(access_token);
        localStorage.setItem('access_token', access_token);
        setUser(user);
        setIsAuthenticated(true);
      }

      return { 
        requiresConfirmation: response.data?.requiresConfirmation ?? false 
      };
      
    } catch (error: any) {
      const message = error.response?.data?.error || 'Signup failed';
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
        clearError,
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