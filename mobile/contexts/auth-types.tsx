export interface User {
  acc_id?: string;
  supabase_id: string;
  username: string;
  email: string;
  profile_image?: string | null;
  resident?: Record<string, any>;
  staff?: Record<string, any>;
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  signUp: (email: string, password: string, username?: string) => Promise<{ requiresConfirmation?: boolean }>;
  refreshSession: () => Promise<void>;
  clearError: () => void;
}