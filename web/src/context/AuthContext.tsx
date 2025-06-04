import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface User {
  id: string;
  username: string;
  email: string;
  profile_image: string;
  rp: any;
  staff: any;
}

interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  login: (userData: User & { accessToken: string; refreshToken: string }) => void;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
  getAccessToken: () => string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);

  useEffect(() => {
    // Only store non-sensitive user data in localStorage
    const storedUser = localStorage.getItem("user")
      ? JSON.parse(localStorage.getItem("user") || "null")
      : null;

    setUser(storedUser);
  }, []);

  const login = (userData: User & { accessToken: string; refreshToken: string }) => {
    // Store user data (non-sensitive) in localStorage
    localStorage.setItem("user", JSON.stringify({
      id: userData.id,
      username: userData.username,
      email: userData.email,
      profile_image: userData.profile_image,
      rp: userData.rp,
      staff: userData.staff
    }));

    // Store tokens in memory only
    setAccessToken(userData.accessToken);
    setRefreshToken(userData.refreshToken);
    setUser({
      id: userData.id,
      username: userData.username,
      email: userData.email,
      profile_image: userData.profile_image,
      rp: userData.rp,
      staff: userData.staff
    });
  };

  const logout = () => {
    // Clear everything
    localStorage.removeItem("user");
    setAccessToken(null);
    setRefreshToken(null);
    setUser(null);
  };

  const updateUser = (updates: Partial<User>) => {
    setUser(prev => {
      if (!prev) return prev;
      
      const updatedUser = { ...prev, ...updates };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      return updatedUser;
    });
  };

  const getAccessToken = () => {
    return accessToken;
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      accessToken,
      login, 
      logout, 
      updateUser,
      getAccessToken
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}