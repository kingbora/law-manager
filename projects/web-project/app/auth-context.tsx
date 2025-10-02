'use client';

import type {
  AuthUser,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  Session,
} from '@law-manager/api-schema/auth';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { ApiError } from '../lib/api-client';
import {
  fetchSession,
  login as loginRequest,
  logout as logoutRequest,
  register as registerRequest,
} from '../lib/auth-client';

type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

type AuthContextValue = {
  user: AuthUser | null;
  session: Session | null;
  status: AuthStatus;
  error: string | null;
  login: (payload: LoginRequest) => Promise<void>;
  register: (payload: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const initialState = {
  status: 'loading' as AuthStatus,
  user: null as AuthUser | null,
  session: null as Session | null,
  error: null as string | null,
};

type State = typeof initialState;

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<State>(initialState);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const applyAuthPayload = useCallback((payload: LoginResponse | null) => {
    if (payload) {
      setState({
        status: 'authenticated',
        user: payload.user,
        session: payload.session,
        error: null,
      });
    } else {
      setState({
        status: 'unauthenticated',
        user: null,
        session: null,
        error: null,
      });
    }
  }, []);

  const refresh = useCallback(async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    try {
      const payload = await fetchSession();
      applyAuthPayload(payload);
    } catch (error) {
      console.error('Failed to refresh auth session', error);
      setState({
        status: 'unauthenticated',
        user: null,
        session: null,
        error: '无法获取登录状态',
      });
    } finally {
      setIsRefreshing(false);
    }
  }, [applyAuthPayload, isRefreshing]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const login = useCallback(
    async ({ identifier, password }: LoginRequest) => {
      setState((prev) => ({ ...prev, error: null }));
      try {
        const payload = await loginRequest({ identifier, password });
        applyAuthPayload(payload);
      } catch (error) {
        const message =
          error instanceof ApiError ? error.message : '登录失败，请稍后再试';
        setState((prev) => ({ ...prev, error: message }));
        throw error;
      }
    },
    [applyAuthPayload],
  );

  const register = useCallback(
    async ({ email, username, password }: RegisterRequest) => {
      setState((prev) => ({ ...prev, error: null }));
      try {
        await registerRequest({ email, username, password });
        const payload = await loginRequest({ identifier: username, password });
        applyAuthPayload(payload);
      } catch (error) {
        const message =
          error instanceof ApiError ? error.message : '注册失败，请稍后再试';
        setState((prev) => ({ ...prev, error: message }));
        throw error;
      }
    },
    [applyAuthPayload],
  );

  const logout = useCallback(async () => {
    try {
      await logoutRequest();
    } finally {
      setState({
        status: 'unauthenticated',
        user: null,
        session: null,
        error: null,
      });
    }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user: state.user,
      session: state.session,
      status: state.status,
      error: state.error,
      login,
      register,
      logout,
      refresh,
    }),
    [
      login,
      logout,
      refresh,
      register,
      state.error,
      state.session,
      state.status,
      state.user,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
