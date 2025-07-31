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
      console.log("🔍 Starting auth status check...");
      
      // First check if we have a valid Supabase session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session?.access_token) {
        console.log("❌ No valid Supabase session found");
        setUser(null);
        setIsAuthenticated(false);
        return;
      }

      console.log("✅ Found Supabase session, verifying with backend...");

      // If we have a session, verify with backend
      const response = await api.get("authentication/mobile/user/");
      
      if (response.data && response.data.user) {
        setUser(response.data.user);
        setIsAuthenticated(true);
        console.log("✅ Authentication verified successfully:", response.data.user.email);
      } else {
        console.warn("⚠️ No user data in response");
        setUser(null);
        setIsAuthenticated(false);
      }
      
    } catch (error: any) {
      console.error("Error details:", {
        status: error?.response?.status,
        data: error?.response?.data,
        message: error?.message
      });
      
      if (error?.response?.status === 401) {
        // 401 = Authentication failed, clear session
        console.log("🧹 Clearing invalid session due to 401...");
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
    console.log("👂 Setting up auth state listener...");
    let mounted = true; 
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return; // Prevent updates if unmounted
        
        if (event === 'SIGNED_OUT' || !session) {
          if (mounted) {
            setUser(null);
            setIsAuthenticated(false);
            setIsLoading(false);
            setError(null); // Clear any permission errors
          }
        } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          // Add delay to prevent rapid successive calls
          setTimeout(() => {
            if (mounted) {
              checkAuthStatus();
            }
          }, 500);
        }
      } 
    );

    // Initial auth check with delay
    setTimeout(() => {
      if (mounted) {
        checkAuthStatus();
      }
    }, 100);

    return () => {
      console.log("🧹 Cleaning up auth state listener");
      mounted = false;
      subscription.unsubscribe();
    };
  }, []); 

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    clearError();

    try {
      const { data: supabaseData, error: supabaseError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (supabaseError) {
        console.error("❌ Supabase authentication failed:", supabaseError);
        throw new Error(supabaseError.message);
      }

      const response = await api.post('authentication/mobile/login/', {
        email,
        password,
      });

      if (response.data && response.data.user) {
        setUser(response.data.user);
        setIsAuthenticated(true);
      } else {
        throw new Error("No user data in login response");
      }
      
    } catch (error: any) {
      console.error("❌ Login error:", error);
      
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
      const response = await api.post('authentication/signup/', {
        email, 
        password,
        username,
      });

      // If signup successful and no confirmation required, user might be auto-logged in
      // if (!response.data.requiresConfirmation && response.data.user) {
      //   setUser(response.data.user);
      //   setIsAuthenticated(true);
      // }

      return { requiresConfirmation: response.data?.requiresConfirmation ?? false };
    } catch (error: any){
      console.error("❌ Signup error:", error);
      
      // If backend signup fails, clean up supabase user
      try {
        await supabase.auth.signOut();
      } catch (cleanupError) {
        console.error("❌ Error during signup cleanup:", cleanupError);
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
      await supabase.auth.signOut();
      
      try {
        await api.post('authentication/logout/');
      } catch (logoutError) {
        console.warn("⚠️ Backend logout failed:", logoutError);
        // Continue anyway
      }

      console.log("✅ Logout successful");

    } catch (error) {
      console.error('❌ Logout error: ', error);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
      setIsLoading(false);
      setError(null);
    }
  };

  const refreshSession = async () => {
    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.refreshSession();
      
      if (error || !data.session) {
        throw new Error("Failed to refresh Supabase session");
      }

      const response = await api.post('authentication/refresh/');
      
      if (response.data && response.data.user) {
        setUser(response.data.user);
        setIsAuthenticated(true);
        console.log("✅ Session refresh successful");
      } else {
        throw new Error("No user data in refresh response");
      }
      
    } catch (error: any) {
      console.error('❌ Session refresh failed: ', error);
      
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