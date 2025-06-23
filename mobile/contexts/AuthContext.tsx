import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '@/lib/supabase';
import { Alert } from 'react-native';
import { api } from '@/api/api';

type AuthUser = {
  id: string;
  email: string;
  access_token: string;
  refresh_token: string;
  django_token?: string;
  acc_id?: string;
};

type AuthContextType = {
  user: AuthUser | null;
  session: any | null;
  isInitializing: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  resetPassword: (newPassword: string) => Promise<any>;
  signInWithGoogle: () => Promise<void>;
  syncWithDjango: (accessToken: string) => Promise<any>;
  getDjangoToken: () => Promise<string | null>;
  isAuthenticated: boolean;
};

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<any | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  const syncWithDjango = async (accessToken: string) => {
    try {
      console.log('Attempting to sync with Django...', { 
        baseURL: api.defaults.baseURL,
        endpoint: 'authentication/mobile/signup/' 
      });

      // Make sure to send empty body with POST request
      const response = await api.post('/authentication/mobile/signup/', {}, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        timeout: 15000, // 15 second timeout
      });

      console.log('Django sync response:', {
        status: response.status,
        data: response.data
      });

      if (response.status < 200 || response.status >= 300) {
        throw new Error(`Failed to sync with Django: ${response.status}`);
      }

      const data = response.data;
      
      // Store Django token if provided
      if (data.django_token) {
        await AsyncStorage.setItem('django_token', data.django_token);
        console.log('Django token stored successfully');
      }
      
      // Store additional sync data if needed
      if (data.acc_id) {
        await AsyncStorage.setItem('acc_id', data.acc_id.toString());
      }
      
      // Show success message
      if (data.is_new_account) {
        Alert.alert('Welcome!', 'Account created successfully');
      } else {
        console.log('Account synced successfully');
      }
      
      return data;
    } catch (error: any) {
      console.error('Django sync error details:', {
        message: error.message,
        code: error.code,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          baseURL: error.config?.baseURL,
          headers: error.config?.headers
        }
      });
      
      // Show user-friendly error message based on error type
      if (error.code === 'NETWORK_ERROR' || error.message === 'Network Error') {
        console.warn('Connection Error: Unable to connect to server. Please check your internet connection.');
      } else if (error.response?.status === 401) {
        console.warn('Authentication Error: Your session has expired.');
      } else if (error.response?.status >= 500) {
        console.warn('Server Error: Server is temporarily unavailable.');
      } else {
        console.warn('Sync Error: Failed to sync with server.');
      }
      
      // Don't throw error to prevent blocking the auth flow
      console.warn('Django sync failed, but continuing with auth flow');
      return null;
    }
  };

  const signInWithGoogle = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/login`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) throw error;
    } catch (error) {
      console.error('Google sign-in error:', error);
      throw error;
    }
  };

  const getDjangoToken = async (): Promise<string | null> => {
    try {
      return await AsyncStorage.getItem('django_token');
    } catch (error) {
      console.error('Error getting Django token:', error);
      return null;
    }
  };

  const updateUserWithDjangoData = async (supabaseUser: AuthUser, djangoData: any) => {
    const updatedUser: AuthUser = {
      ...supabaseUser,
      django_token: djangoData?.django_token,
      acc_id: djangoData?.acc_id?.toString(),
    };
    setUser(updatedUser);
    return updatedUser;
  };

  useEffect(() => {
    // Initialize the session
    const initializeAuth = async () => {
      try {
        // Get stored session first
        const storedSession = await AsyncStorage.getItem('supabase_session');
        const storedDjangoToken = await AsyncStorage.getItem('django_token');
        const storedAccountId = await AsyncStorage.getItem('acc_id');
        
        // Get current session from Supabase
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
        }
        
        setSession(session);
        
        if (session) {
          const userData: AuthUser = {
            id: session.user.id,
            email: session.user.email ?? '',
            access_token: session.access_token,
            refresh_token: session.refresh_token,
            django_token: storedDjangoToken || undefined,
            acc_id: storedAccountId || undefined,
          };
          setUser(userData);
          
          // Sync with Django in the background if no Django token exists
          if (!storedDjangoToken) {
            syncWithDjango(session.access_token)
              .then(djangoData => {
                if (djangoData) {
                  updateUserWithDjangoData(userData, djangoData);
                }
              })
              .catch(e => console.error('Background sync failed:', e));
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setIsInitializing(false);
      }
    };

    initializeAuth();

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log(`Supabase auth event: ${event}`);
      setSession(session);
      
      if (session) {
        const userData: AuthUser = {
          id: session.user.id,
          email: session.user.email ?? '',
          access_token: session.access_token,
          refresh_token: session.refresh_token,
        };
        
        // Store Supabase session data
        try {
          await AsyncStorage.multiSet([
            ['supabase_session', JSON.stringify(session)],
            ['access_token', session.access_token],
            ['refresh_token', session.refresh_token],
          ]);
        } catch (error) {
          console.error('Error storing session data:', error);
        }

        // Sync with Django when session changes
        try {
          const djangoData = await syncWithDjango(session.access_token);
          if (djangoData) {
            await updateUserWithDjangoData(userData, djangoData);
          } else {
            setUser(userData);
          }
        } catch (error) {
          console.error('Django sync failed:', error);
          setUser(userData); // Set user even if Django sync fails
        }
      } else {
        setUser(null);
        // Clear all stored data
        try {
          await AsyncStorage.multiRemove([
            'supabase_session', 
            'access_token', 
            'refresh_token',
            'django_token',
            'acc_id'
          ]);
        } catch (error) {
          console.error('Error clearing stored data:', error);
        }
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;
      if (!data.session) throw new Error('No session returned');
      
      // The auth state change listener will handle the rest
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const register = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password
      });

      if (error) throw error;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      // Clear local storage first
      await AsyncStorage.multiRemove([
        'supabase_session', 
        'access_token', 
        'refresh_token',
        'django_token',
        'acc_id'
      ]);
      
      // Sign out from Supabase
      await supabase.auth.signOut();
      
      // Clear local state
      setUser(null);
      setSession(null);
    } catch (error) {
      console.error('Failed to logout', error);
      throw error;
    }
  };

  const resetPassword = async (newPassword: string) => {
    try {
      const { data, error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Password reset error:', error);
      throw error;
    }
  };

  const contextValue: AuthContextType = {
    user,
    session,
    isInitializing,
    login,
    logout,
    register,
    resetPassword,
    signInWithGoogle,
    syncWithDjango,
    getDjangoToken,
    isAuthenticated: !!user && !!session,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};