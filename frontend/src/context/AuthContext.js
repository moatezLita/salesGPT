// src/context/AuthContext.js
'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import axiosInstance from '@/services/axios/instance';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  // Initialize auth state from Supabase
  useEffect(() => {
    const initAuth = async () => {
      setLoading(true);
      
      // Get initial session
      const { data: { session: initialSession } } = await supabase.auth.getSession();
      setSession(initialSession);
      
      if (initialSession) {
        // Get user profile from session
        setUser(initialSession.user);
        
        // Set token in axios headers for backend API authentication
        const token = initialSession.access_token;
        if (token) {
          axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        }
      }
      
      setLoading(false);

      // Listen for auth changes
      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        setSession(session);
        setUser(session?.user || null);
        
        // Update axios auth header when session changes
        if (session) {
          axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${session.access_token}`;
        } else {
          delete axiosInstance.defaults.headers.common['Authorization'];
        }
      });

      // Cleanup subscription
      return () => subscription.unsubscribe();
    };

    initAuth();
  }, []);

  // Sign up with email
  const signUp = async (email, password, metadata = {}) => {
    setError(null);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata, // Optional user metadata
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      });
      
      if (error) throw error;
      return data;
    } catch (err) {
      setError(err.message || 'Sign up failed');
      throw err;
    }
  };

  // Sign in with email
  const signIn = async (email, password) => {
    setError(null);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) throw error;
      return data;
    } catch (err) {
      setError(err.message || 'Sign in failed');
      throw err;
    }
  };

  // Sign in with Google
  const signInWithGoogle = async () => {
    setError(null);
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });
      
      if (error) throw error;
      return data;
    } catch (err) {
      setError(err.message || 'Google sign in failed');
      throw err;
    }
  };

  // Reset password
  const resetPassword = async (email) => {
    setError(null);
    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });
      
      if (error) throw error;
      return data;
    } catch (err) {
      setError(err.message || 'Password reset failed');
      throw err;
    }
  };

  // Update password
  const updatePassword = async (newPassword) => {
    setError(null);
    try {
      const { data, error } = await supabase.auth.updateUser({
        password: newPassword
      });
      
      if (error) throw error;
      return data;
    } catch (err) {
      setError(err.message || 'Password update failed');
      throw err;
    }
  };

  // Sign out
  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      // Clear axios auth header
      delete axiosInstance.defaults.headers.common['Authorization'];
      
      router.push('/');
    } catch (err) {
      setError(err.message || 'Sign out failed');
      console.error('Sign out error:', err);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      loading,
      error,
      signUp,
      signIn,
      signInWithGoogle,
      resetPassword,
      updatePassword,
      signOut,
      isAuthenticated: !!user
    }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};