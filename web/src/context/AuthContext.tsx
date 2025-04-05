import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface User {
  username: string;
  email: string;
  profile_image: string;
  token: string;
  rp: any;
  staff: any
}

interface AuthContextType {
  user: User | null;
  login: (userData: User) => void;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("token")
      ? {
          username: localStorage.getItem("username") || "",
          email: localStorage.getItem("email") || "",
          profile_image: localStorage.getItem("profile_image") || "",
          token: localStorage.getItem("token") || "",
          rp: JSON.parse(localStorage.getItem("rp") || "null"),
          staff: JSON.parse(localStorage.getItem("staff") || "null"),
        }
      : null;

    setUser(storedUser);  
  }, []);

  const login = (userData: User) => {
    localStorage.setItem("username", userData.username);
    localStorage.setItem("email", userData.email);
    localStorage.setItem("profile_image", userData.profile_image);
    localStorage.setItem("token", userData.token);
    localStorage.setItem("rp", JSON.stringify(userData.rp));
    localStorage.setItem("staff", JSON.stringify(userData.staff));
    setUser(userData);
  };

  const logout = () => {
    localStorage.clear();
    setUser(null);
  };

  const updateUser = (updates: Partial<User>) => { 
    setUser(prev => {
      if (!prev) return prev;

      const updatedUser = { ...prev, ...updates }; 

      Object.entries(updates).forEach(([key, value]) => {
        localStorage.setItem(key, value || "");
      });
      
      return updatedUser; 
    });
  };


  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser }}>
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