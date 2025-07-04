export const STAFF_TYPES = {
  BARANGAY: 'Barangay Staff',
  HEALTH: 'Health Staff'
} as const;

// Interfaces
export interface Assignment {
  id: string;
  
  [key: string]: any; // Replace with actual assignment fields
}

export interface Staff {
  staff_id: string;
  staff_type: typeof STAFF_TYPES[keyof typeof STAFF_TYPES] | string;
  assignments: Assignment[];
}

export interface Resident {
  rp_id: string;
  staff?: Staff;
}

export interface User {
  acc_id?: string;
  supabase_id: string;
  username: string;
  email: string;
  profile_image?: string | null;
  resident?: Resident;
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
  signInWithGoogle: () => Promise<void>;
  refreshSession: () => Promise<void>;
  clearError: () => void;
}