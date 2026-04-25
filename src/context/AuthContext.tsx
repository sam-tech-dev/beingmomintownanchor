import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import type { AuthUser } from '../api/townanchorApi';

type AuthState = {
  token: string | null;
  user: AuthUser | null;
  isLoading: boolean;
};

type AuthContextValue = AuthState & {
  login: (token: string, user: AuthUser) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (user: AuthUser) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, setState] = useState<AuthState>({
    token: null,
    user: null,
    isLoading: true,
  });

  useEffect(() => {
    const restore = async () => {
      try {
        const token = await SecureStore.getItemAsync('auth_token');
        const userJson = await SecureStore.getItemAsync('auth_user');
        if (token && userJson) {
          setState({ token, user: JSON.parse(userJson), isLoading: false });
        } else {
          setState((s) => ({ ...s, isLoading: false }));
        }
      } catch {
        setState((s) => ({ ...s, isLoading: false }));
      }
    };
    restore();
  }, []);

  const login = useCallback(async (token: string, user: AuthUser) => {
    await SecureStore.setItemAsync('auth_token', token);
    await SecureStore.setItemAsync('auth_user', JSON.stringify(user));
    setState({ token, user, isLoading: false });
  }, []);

  const logout = useCallback(async () => {
    await SecureStore.deleteItemAsync('auth_token');
    await SecureStore.deleteItemAsync('auth_user');
    setState({ token: null, user: null, isLoading: false });
  }, []);

  const updateUser = useCallback(async (user: AuthUser) => {
    await SecureStore.setItemAsync('auth_user', JSON.stringify(user));
    setState((s) => ({ ...s, user }));
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
