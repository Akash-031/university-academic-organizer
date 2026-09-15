import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { registerApi, loginApi, logoutApi, fetchCurrentUserApi } from '../services/authApi';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadCurrentUser = useCallback(async () => {
    try {
      const { user: currentUser } = await fetchCurrentUserApi();
      setUser(currentUser || null);
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCurrentUser();
  }, [loadCurrentUser]);

  const register = async ({ name, email, password }) => {
    const { user: newUser } = await registerApi({ name, email, password });
    setUser(newUser);
    return newUser;
  };

  const login = async ({ email, password }) => {
    const { user: loggedInUser } = await loginApi({ email, password });
    setUser(loggedInUser);
    return loggedInUser;
  };

  const logout = async () => {
    try {
      await logoutApi();
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, register, login, logout, refreshUser: loadCurrentUser }}>
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
