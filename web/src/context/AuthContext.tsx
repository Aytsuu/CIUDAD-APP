import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from "react";
import { Session } from "@supabase/supabase-js";
import supabase from "@/supabase/supabase";
import { api } from "@/api/api";
import { AuthContextType, User} from "./auth-types";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const clearError = () => setError(null);

  const handleError = (error: unknown, defaultMessage: string) => {
    const message = error instanceof Error ? error.message : 
                  (error as any)?.response?.data?.error || defaultMessage;
    setError(message);
    throw new Error(message);
  };

  const syncWithDjango = async (session: Session | null): Promise<User | null> => {
    if (!session?.user) return null;
    
    try {
      const response = await api.post('/authentication/login/', {
        supabase_id: session.user.id,
        email: session.user.email,
        username: session.user.user_metadata?.username || session.user.email?.split('@')[0],
        profile_image: session.user.user_metadata?.avatar_url || 
                     'https://isxckceeyjcwvjipndfd.supabase.co/storage/v1/object/public/userimage//sanRoqueLogo.svg',
      });
      return response.data;
    } catch (error) {
      console.error('Django sync error:', error);
      throw error;
    }
  };

  const handleSessionChange = useCallback(async (session: Session | null) => {
    setIsLoading(true);
    try {
      if (session?.user) {
        const user = await syncWithDjango(session);
        setUser({
          supabase_id: session.user.id,
          email: session.user.email || "",
          username: user?.username || session.user.user_metadata?.username,
          profile_image: user?.profile_image || session.user.user_metadata?.avatar_url,
        });
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      handleError(error, "Session error");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        if (mounted) await handleSessionChange(session);
      } catch (error) {
        if (mounted) handleError(error, "Initialization error");
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (mounted) await handleSessionChange(session);
    });

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, [handleSessionChange]);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    clearError();
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      if (!data?.session) throw new Error("No session returned");

      const user = await syncWithDjango(data.session);
      if (!user?.staff){
        await supabase.auth.signOut();
        throw new Error("Only authorized staff can access this system");
      }

      await handleSessionChange(data.session);
      
    } catch (error) {
      handleError(error, "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (email: string, password: string, username?: string) => {
    setIsLoading(true);
    clearError();
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { username },
          emailRedirectTo: `${window.location.origin}/dashboard`,
        },
      });

      if (error) throw error;
      if (!data.user) throw new Error("No user returned");

      await api.post('/authentication/signup/', {
        supabase_id: data.user.id,
        email: data.user.email,
        username: username || data.user.email?.split('@')[0]
      });

      if (!data.session) {
        return { requiresConfirmation: true };
      }

      await handleSessionChange(data.session);
      return { requiresConfirmation: false };
    } catch (error) {
      handleError(error, "Signup failed");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    setIsLoading(true);
    clearError();
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });
      if (error) throw error;
    } catch (error) {
      handleError(error, "Google login failed");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      handleError(error, "Logout failed");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const refreshSession = async () => {
    setIsLoading(true);
    try {
      const { data: { session }, error } = await supabase.auth.refreshSession();
      if (error) throw error;
      await handleSessionChange(session);
    } catch (error) {
      handleError(error, "Session refresh failed");
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
        signInWithGoogle,
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
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};