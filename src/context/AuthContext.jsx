import React, { createContext, useContext, useEffect, useState } from 'react';
import { authService } from '../services/authService';
import { isFirebaseConfigured } from '../config/firebase';

const AuthContext = createContext({
  user: null,
  loading: true,
  isFirebaseConfigured: false,
  loginWithGoogle: async () => {},
  loginWithEmail: async () => {},
  registerWithEmail: async () => {},
  logout: async () => {},
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = authService.subscribeToAuth((currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    try {
      const u = await authService.loginWithGoogle();
      setUser(u);
      return u;
    } catch (err) {
      console.error('Google login error:', err);
      throw err;
    }
  };

  const loginWithEmail = async (email, password) => {
    try {
      const u = await authService.loginWithEmail(email, password);
      setUser(u);
      return u;
    } catch (err) {
      console.error('Email login error:', err);
      throw err;
    }
  };

  const registerWithEmail = async (email, password, displayName) => {
    try {
      const u = await authService.registerWithEmail(email, password, displayName);
      setUser(u);
      return u;
    } catch (err) {
      console.error('Email register error:', err);
      throw err;
    }
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isFirebaseConfigured,
        loginWithGoogle,
        loginWithEmail,
        registerWithEmail,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
