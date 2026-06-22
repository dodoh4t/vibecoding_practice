import { createContext, useContext } from 'react';
import type { User } from './types';

export type AuthState = {
  token: string | null;
  user: User | null;
  notice: string | null;
};

export type AuthContextValue = AuthState & {
  isAuthenticated: boolean;
  setSession: (token: string, user: User) => void;
  clearSession: (notice?: string) => void;
  clearNotice: () => void;
};

export const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider.');
  }
  return context;
}
