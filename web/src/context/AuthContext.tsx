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
import supabase from "@/supabase/supabase";

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
      
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session?.access_token) {
        console.log("No valid Supabase session found");
        setUser(null);
        setIsAuthenticated(false);
        return;
      }

      const response = await api.get("authentication/user/");
      setUser(response.data.user);
      setIsAuthenticated(true);
      
    } catch (error: any) {
      console.error("Authentication check failed:", error);
      
      if (error?.response?.status === 401 || error?.response?.status === 403) {
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
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Supabase auth state changed:", event, session?.user?.email);
        
        if (event === 'SIGNED_OUT' || !session) {
          setUser(null);
          setIsAuthenticated(false);
          setIsLoading(false);
        } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          // It does not automatically set as authenticated it waits for backend verification
          if (event === 'TOKEN_REFRESHED') {
            checkAuthStatus();
          }
        }
      }
    );

    checkAuthStatus();

    return () => subscription.unsubscribe();
  }, [checkAuthStatus]);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    clearError();

    try {
      const { data: supabaseData, error: supabaseError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (supabaseError) {
        throw new Error(supabaseError.message);
      }

      const response = await api.post('authentication/web/login/', {
        email,
        password,
      });
      
      console.log("Login successful:", response.data);
      setUser(response.data.user);
      setIsAuthenticated(true);
      console.log("position: ", response.data.user.staff.assignments[0].pos.pos_title)
      console.log("position: ", response.data.user.staff.assignments[1].pos.pos_title)
    } catch (error: any) {
      console.error("Login error:", error);
      
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
      if (!response.data.requiresConfirmation && response.data.user) {
        setUser(response.data.user);
        setIsAuthenticated(true);
      }

      return { 
        requiresConfirmation: response.data?.requiresConfirmation ?? false 
      };
      
    } catch (error: any) {
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
      await supabase.auth.signOut();
      
      await api.post('authentication/logout/');

    } catch (error) {
      console.error('Logout error: ', error);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
      setIsLoading(false);
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
      setUser(response.data.user);
      setIsAuthenticated(true);
      
    } catch (error: any) {
      console.error('Session refresh failed: ', error);
      
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