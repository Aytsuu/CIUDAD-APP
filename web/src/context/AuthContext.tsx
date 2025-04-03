import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface User {
  id: string;
  username: string;
  email: string;
  profile_image: string;
  token: string;
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
          id: localStorage.getItem("id") || "",
          username: localStorage.getItem("username") || "",
          email: localStorage.getItem("email") || "",
          profile_image: localStorage.getItem("profile_image") || "",
          token: localStorage.getItem("token") || "",
        }
      : null;

    setUser(storedUser);  
  }, []);

  useEffect(() => {
    if (user) {
      localStorage.setItem("id", user.id);
      localStorage.setItem("username", user.username);
      localStorage.setItem("email", user.email);
      localStorage.setItem("profile_image", user.profile_image);
      localStorage.setItem("token", user.token);
    } else {
      localStorage.clear();
    }
  }, [user])

  const login = (userData: User) => {
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