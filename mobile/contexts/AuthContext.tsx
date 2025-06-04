import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type AuthUser = {
  id: number;
  username: string;
  email: string;
  token: string;
  refresh_token: string;
  profile_image?: string;
  rp?: string | null;
  staff?: boolean;
};

type AuthContextType = {
  user: AuthUser | null;
  isInitializing: boolean;
  login: (userData: AuthUser) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const storedUser = await AsyncStorage.getItem('user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error('Failed to load user', error);
      } finally {
        setIsInitializing(false);
      }
    };

    loadUser();
  }, []);

  const login = async (userData: AuthUser) => {
    try {
      await AsyncStorage.multiSet([
        ['user', JSON.stringify(userData)],
        ['accessToken', userData.token],
        ['refreshToken', userData.refresh_token],
      ]);
      setUser(userData);
    } catch (error) {
      console.error('Failed to save user', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.multiRemove(['user', 'accessToken', 'refreshToken']);
      setUser(null);
    } catch (error) {
      console.error('Failed to remove user', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, isInitializing, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};