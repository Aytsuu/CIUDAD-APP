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

// Constants
const STAFF_TYPES = {
  BARANGAY: 'Barangay Staff',
  HEALTH: 'Health Staff'
} as const;

// Interfaces
interface Assignment {
  id: string;
  [key: string]: any; // Replace with actual assignment fields
}

interface StaffProfile {
  staff_id: string;
  staff_type: typeof STAFF_TYPES[keyof typeof STAFF_TYPES] | string;
  assignments: Assignment[];
}

interface ResidentProfile {
  rp_id: string;
  staff?: StaffProfile;
}

interface DjangoUser {
  acc_id: number;
  supabase_id: string;
  username: string;
  email: string;
  profile_image?: string | null;
  resident_profile?: ResidentProfile;
}

interface User {
  id: string;
  email: string;
  username?: string;
  profile_image?: string | null;
  djangoUser: DjangoUser | null;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  signUp: (email: string, password: string, username?: string) => Promise<{ requiresConfirmation?: boolean }>;
  signInWithGoogle: () => Promise<void>;
  refreshSession: () => Promise<void>;
  clearError: () => void;
  isBarangayStaff: () => boolean;
  isHealthStaff: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const clearError = () => setError(null);

  const isBarangayStaff = () => {
    return user?.djangoUser?.resident_profile?.staff?.staff_type === STAFF_TYPES.BARANGAY;
  };

  const isHealthStaff = () => {
    return user?.djangoUser?.resident_profile?.staff?.staff_type === STAFF_TYPES.HEALTH;
  };

  const handleError = (error: unknown, defaultMessage: string) => {
    const message = error instanceof Error ? error.message : 
                  (error as any)?.response?.data?.error || defaultMessage;
    setError(message);
    throw new Error(message);
  };

  const syncWithDjango = async (session: Session | null): Promise<DjangoUser | null> => {
    if (!session?.user) return null;
    
    try {
      const response = await api.post('/authentication/login/', {
        supabase_id: session.user.id,
        email: session.user.email,
        username: session.user.user_metadata?.username || session.user.email?.split('@')[0],
        profile_image: session.user.user_metadata?.avatar_url || 
                     'https://isxckceeyjcwvjipndfd.supabase.co/storage/v1/object/public/userimage//sanRoqueLogo.svg'
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
        const djangoUser = await syncWithDjango(session);
        setUser({
          id: session.user.id,
          email: session.user.email || "",
          username: djangoUser?.username || session.user.user_metadata?.username,
          profile_image: djangoUser?.profile_image || session.user.user_metadata?.avatar_url,
          djangoUser
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

      const djangoUser = await syncWithDjango(data.session);
      
      const staffType = djangoUser?.resident_profile?.staff?.staff_type;
      if (!staffType || !Object.values(STAFF_TYPES).includes(staffType as any)) {
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
        isBarangayStaff,
        isHealthStaff,
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