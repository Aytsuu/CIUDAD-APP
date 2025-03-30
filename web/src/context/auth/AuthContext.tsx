import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContextType, User } from './authTypes';
import { login, register, fetchUser } from '../api/authApi';
import { clearTokens } from './authUtils';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      fetchUser().then((user) => setUser(user));
    }
  }, []);

  const handleLogin = async (username: string, password: string) => {
    const tokens = await login(username, password);
    localStorage.setItem('access_token', tokens.access);
    localStorage.setItem('refresh_token', tokens.refresh);
    const user = await fetchUser();
    setUser(user);
    navigate('/');
  };

  const handleRegister = async (username: string, email: string, password: string) => {
    await register(username, email, password);
    await handleLogin(username, password);
  };

  const handleLogout = () => {
    clearTokens();
    setUser(null);
    navigate('/login');
  };

  const value = {
    user,
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};