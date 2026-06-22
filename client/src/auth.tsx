import {
  useCallback,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { AuthContext, type AuthState } from './auth-context';
import type { User } from './types';

const STORAGE_KEY = 'dodotodolist.auth';

function readStoredAuth(): AuthState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { token: null, user: null, notice: null };

    const parsed = JSON.parse(raw) as Pick<AuthState, 'token' | 'user'>;
    if (!parsed.token || !parsed.user) return { token: null, user: null, notice: null };

    return { token: parsed.token, user: parsed.user, notice: null };
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return { token: null, user: null, notice: null };
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>(() => readStoredAuth());

  const setSession = useCallback((token: string, user: User) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ token, user }));
    setState({ token, user, notice: null });
  }, []);

  const clearSession = useCallback((notice?: string) => {
    localStorage.removeItem(STORAGE_KEY);
    setState({ token: null, user: null, notice: notice || null });
  }, []);

  const clearNotice = useCallback(() => {
    setState((current) => ({ ...current, notice: null }));
  }, []);

  const value = useMemo(
    () => ({
      ...state,
      isAuthenticated: Boolean(state.token && state.user),
      setSession,
      clearSession,
      clearNotice,
    }),
    [clearNotice, clearSession, setSession, state],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
