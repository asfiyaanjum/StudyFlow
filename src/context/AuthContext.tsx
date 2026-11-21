import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { UserProfile } from '../types';
import { api } from '../services/api';
import { isSupabaseConfigured, supabase } from '../services/supabaseClient';

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  isAuthenticated: boolean;
  isConfigured: boolean;
  signIn: (identifier: string, password: string) => Promise<{ success: boolean; error?: string; isUnconfirmedEmail?: boolean }>;
  signUp: (username: string, email: string, password: string, fullName?: string) => Promise<{ success: boolean; error?: string; emailConfirmationRequired?: boolean }>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const isConfigured = isSupabaseConfigured();

  const loadUser = useCallback(async () => {
    try {
      setLoading(true);
      const currentUser = await api.auth.getCurrentUser();
      setUser(currentUser);
    } catch (e) {
      console.error('Failed to restore user session:', e);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();

    if (isConfigured) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
          if (session?.user) {
            await loadUser();
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
        }
      });

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [isConfigured, loadUser]);

  const signIn = async (identifier: string, password: string) => {
    try {
      const { user: authedUser, error, isUnconfirmedEmail } = await api.auth.signIn(identifier, password);
      if (error) {
        return { success: false, error, isUnconfirmedEmail };
      }
      setUser(authedUser);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'An unexpected error occurred.' };
    }
  };

  const signUp = async (username: string, email: string, password: string, fullName?: string) => {
    try {
      const { user: newUser, error, emailConfirmationRequired } = await api.auth.signUp(
        username,
        email,
        password,
        fullName
      );
      if (error) {
        return { success: false, error };
      }
      if (!emailConfirmationRequired && newUser) {
        setUser(newUser);
      }
      return { success: true, emailConfirmationRequired };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to create account.' };
    }
  };

  const signOut = async () => {
    await api.auth.signOut();
    setUser(null);
  };

  const refreshUser = async () => {
    await loadUser();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        isConfigured,
        signIn,
        signUp,
        signOut,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

