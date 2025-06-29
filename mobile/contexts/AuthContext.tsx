import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from "react";
import { AuthContextType, User } from "./auth-types";
import { api } from "@/api/api";
import { supabase } from "@/lib/supabase";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const clearError = () => setError(null);

  const handleError = (error: any, defaultMessage: string) => {
    const message = error?.message || defaultMessage;
    setError(message);
    throw new Error(message);
  };

  // Check authentication status on app load
  const checkAuthStatus = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // First check if we have a valid Supabase session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session?.access_token) {
        console.log("No valid Supabase session found");
        setUser(null);
        setIsAuthenticated(false);
        return;
      }

      console.log("Found Supabase session, verifying with backend...");

      // If we have a session, verify with backend
      const response = await api.get("authentication/user/");
      setUser(response.data.user);
      setIsAuthenticated(true);
      
      console.log("Authentication verified successfully");
      
    } catch (error: any) {
      console.error("Authentication check failed:", error);
      
      // If backend call fails, clear Supabase session too
      if (error?.response?.status === 401 || error?.response?.status === 403) {
        console.log("Clearing invalid session...");
        await supabase.auth.signOut();
      }
      
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Listen to Supabase auth changes
  useEffect(() => {
    console.log("Setting up auth state listener...");
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Supabase auth state changed:", event, session?.user?.email);
        
        if (event === 'SIGNED_OUT' || !session) {
          setUser(null);
          setIsAuthenticated(false);
          setIsLoading(false);
        } else if (event === 'SIGNED_IN') {
          // Don't automatically set as authenticated - wait for backend verification
          console.log("User signed in, will verify with backend");
        } else if (event === 'TOKEN_REFRESHED') {
          console.log("Token refreshed, re-checking auth status");
          checkAuthStatus();
        }
      }
    );

    // Initial auth check
    checkAuthStatus();

    return () => {
      console.log("Cleaning up auth state listener");
      subscription.unsubscribe();
    };
  }, [checkAuthStatus()]);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    clearError();

    try {
      console.log("Starting login process...");
      
      // First authenticate with Supabase
      const { data: supabaseData, error: supabaseError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (supabaseError) {
        console.error("Supabase authentication failed:", supabaseError);
        throw new Error(supabaseError.message);
      }

      console.log("Supabase authentication successful, verifying with backend...");

      // Then authenticate with your backend
      const response = await api.post('authentication/login/', {
        email,
        password,
      });
      
      console.log("Backend authentication successful:", response.data.user.email);
      setUser(response.data.user);
      setIsAuthenticated(true);
      
    } catch (error: any) {
      console.error("Login error:", error);
      
      // Sign out from Supabase if backend login fails
      await supabase.auth.signOut();
      
      const message = error?.response?.data?.error || error?.message || 'Login failed';
      handleError({message}, "Login failed");
    } finally {
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
      console.log("Starting signup process...");
      
      const response = await api.post('authentication/signup/', {
        email, 
        password,
        username,
      });

      console.log("Signup successful:", response.data);
      
      // If signup successful and no confirmation required, user might be auto-logged in
      if (!response.data.requiresConfirmation && response.data.user) {
        setUser(response.data.user);
        setIsAuthenticated(true);
      }

      return { requiresConfirmation: response.data?.requiresConfirmation ?? false };
    } catch (error: any){
      console.error("Signup error:", error);
      
      // If backend signup fails, make sure to clean up any Supabase user that might have been created
      try {
        await supabase.auth.signOut();
      } catch (cleanupError) {
        console.error("Error during signup cleanup:", cleanupError);
      }
      
      const message = error.response?.data?.error || 'Signup failed';
      handleError({message}, "Signup failed");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);

    try {
      console.log("Starting logout process...");
      
      // Sign out from Supabase first
      await supabase.auth.signOut();
      
      // Then call backend logout
      await api.post('authentication/logout/');

      console.log("Logout successful");

    } catch (error) {
      console.error('Logout error: ', error);
    } finally {
      // Always clear local state
      setUser(null);
      setIsAuthenticated(false);
      setIsLoading(false);
    }
  };

  const refreshSession = async () => {
    setIsLoading(true);

    try {
      console.log("Refreshing session...");
      
      // Refresh Supabase session first
      const { data, error } = await supabase.auth.refreshSession();
      
      if (error || !data.session) {
        throw new Error("Failed to refresh Supabase session");
      }

      // Then refresh with backend
      const response = await api.post('authentication/refresh/');
      setUser(response.data.user);
      setIsAuthenticated(true);
      
      console.log("Session refresh successful");
      
    } catch (error: any) {
      console.error('Session refresh failed: ', error);
      
      // If refresh fails, sign out completely
      await supabase.auth.signOut();
      setUser(null);
      setIsAuthenticated(false);
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
        refreshSession,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if(!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};