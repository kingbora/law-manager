import {
  AuthErrorSchema,
  AuthUser,
  LoginRequest,
  LoginRequestSchema,
  LoginResponse,
  LoginResponseSchema,
  LogoutResponse,
  LogoutResponseSchema,
  RegisterRequest,
  RegisterRequestSchema,
  RegisterResponse,
  RegisterResponseSchema,
  Session,
} from '@law-manager/api-schema/auth';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { z } from 'zod';

const DEFAULT_BASE_URL = 'http://localhost:4000';
const DEFAULT_PREFIX = '/api';

type MaybeProcess = { env?: Record<string, string | undefined> };

const readEnv = (key: string): string | undefined => {
  try {
    const maybeProcess = (globalThis as { process?: MaybeProcess }).process;
    return maybeProcess?.env?.[key];
  } catch {
    return undefined;
  }
};

const resolveEnvBaseUrl = () =>
  readEnv('NEXT_PUBLIC_SERVER_BASE_URL') ??
  readEnv('EXPO_PUBLIC_SERVER_BASE_URL') ??
  readEnv('SERVER_BASE_URL') ??
  readEnv('REACT_APP_SERVER_BASE_URL') ??
  undefined;

const resolveEnvPrefix = () =>
  readEnv('NEXT_PUBLIC_API_PREFIX') ??
  readEnv('EXPO_PUBLIC_API_PREFIX') ??
  readEnv('API_PREFIX') ??
  readEnv('REACT_APP_API_PREFIX') ??
  undefined;

export const normalizeBase = (value: string | undefined) => {
  if (!value) return DEFAULT_BASE_URL;
  return value.endsWith('/') ? value.slice(0, -1) : value;
};

export const normalizePrefix = (value: string | undefined) => {
  if (!value) return DEFAULT_PREFIX;
  return value.startsWith('/') ? value : `/${value}`;
};

export class ApiError extends Error {
  status: number;
  payload: unknown;

  constructor(message: string, status: number, payload: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.payload = payload;
  }
}

const extractErrorMessage = (payload: unknown, fallback: string) => {
  if (!payload) return fallback;
  const parsed = AuthErrorSchema.safeParse(payload);
  if (parsed.success) {
    return parsed.data.details
      ? `${parsed.data.error}: ${parsed.data.details}`
      : parsed.data.error;
  }

  if (typeof payload === 'string') {
    return payload;
  }

  if (typeof payload === 'object' && payload && 'message' in payload) {
    return String((payload as { message?: unknown }).message ?? fallback);
  }

  return fallback;
};

export type ApiFetchOptions = RequestInit & {
  schema?: z.ZodTypeAny;
  allowedStatus?: number[];
};

export type AuthClientConfig = {
  baseUrl?: string;
  prefix?: string;
  fetch?: typeof fetch;
  defaultHeaders?: HeadersInit;
};

export type ApiClient = ReturnType<typeof createApiClient>;

export const createApiClient = (config: AuthClientConfig = {}) => {
  const baseUrl = normalizeBase(config.baseUrl ?? resolveEnvBaseUrl());
  const prefix = normalizePrefix(config.prefix ?? resolveEnvPrefix());

  const fetchImpl =
    config.fetch ??
    (typeof fetch !== 'undefined' ? fetch.bind(globalThis) : undefined);

  if (!fetchImpl) {
    throw new Error(
      'No fetch implementation available. Provide one via config.fetch.',
    );
  }

  const buildUrl = (path: string) => {
    const sanitizedPath = path.startsWith('/') ? path.slice(1) : path;
    return `${baseUrl}${prefix}/${sanitizedPath}`;
  };

  const apiFetch = async <T = unknown,>(
    path: string,
    options: ApiFetchOptions = {},
  ) => {
    const { schema, allowedStatus = [], headers, ...init } = options;

    const requestHeaders = new Headers(config.defaultHeaders ?? undefined);
    if (headers) {
      const runtimeHeaders = new Headers(headers as HeadersInit);
      runtimeHeaders.forEach((value: string, key: string) => {
        requestHeaders.set(key, value);
      });
    }

    if (init.body && !requestHeaders.has('content-type')) {
      requestHeaders.set('content-type', 'application/json');
    }

    const response = await fetchImpl(buildUrl(path), {
      credentials: 'include',
      ...init,
      headers: requestHeaders,
    });

    if (!response.ok && !allowedStatus.includes(response.status)) {
      let payload: unknown = null;
      const contentType = response.headers.get('content-type') ?? '';
      if (contentType.includes('application/json')) {
        payload = await response.json().catch(() => null);
      } else if (contentType.startsWith('text/')) {
        payload = await response.text().catch(() => null);
      }

      const message = extractErrorMessage(
        payload,
        response.statusText || 'Request failed',
      );
      throw new ApiError(message, response.status, payload);
    }

    if (response.status === 204) {
      return undefined as T;
    }

    const contentType = response.headers.get('content-type') ?? '';
    let data: unknown = null;

    if (contentType.includes('application/json')) {
      data = await response.json().catch(() => null);
    } else if (contentType.startsWith('text/')) {
      data = await response.text().catch(() => null);
    }

    if (schema) {
      return schema.parse(data) as T;
    }

    return data as T;
  };

  return {
    baseUrl,
    prefix,
    buildUrl,
    apiFetch,
  } as const;
};

export const DEFAULT_ALLOWED_STATUS = [401];

export type AuthClient = ReturnType<typeof createAuthClient>;

export const createAuthClient = (config?: AuthClientConfig) => {
  const api = createApiClient(config);

  return {
    ...api,
    async login(payload: LoginRequest): Promise<LoginResponse> {
      const body = LoginRequestSchema.parse(payload);
      return api.apiFetch<LoginResponse>('auth/login', {
        method: 'POST',
        body: JSON.stringify(body),
        schema: LoginResponseSchema,
      });
    },
    async register(payload: RegisterRequest): Promise<RegisterResponse> {
      const body = RegisterRequestSchema.parse(payload);
      return api.apiFetch<RegisterResponse>('auth/register', {
        method: 'POST',
        body: JSON.stringify(body),
        schema: RegisterResponseSchema,
      });
    },
    async logout(): Promise<LogoutResponse> {
      return api.apiFetch<LogoutResponse>('auth/logout', {
        method: 'POST',
        schema: LogoutResponseSchema,
      });
    },
    async fetchSession(): Promise<LoginResponse | null> {
      return api.apiFetch<LoginResponse | null>('auth/session', {
        method: 'GET',
        schema: LoginResponseSchema.nullable(),
        allowedStatus: DEFAULT_ALLOWED_STATUS,
      });
    },
  } as const;
};

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

export type AuthContextValue = {
  user: AuthUser | null;
  session: Session | null;
  status: AuthStatus;
  error: string | null;
  login: (payload: LoginRequest) => Promise<void>;
  register: (payload: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
};

type AuthState = {
  user: AuthUser | null;
  session: Session | null;
  status: AuthStatus;
  error: string | null;
};

const initialState: AuthState = {
  user: null,
  session: null,
  status: 'loading',
  error: null,
};

export const createAuthContext = (client: AuthClient) => {
  const AuthContext = createContext<AuthContextValue | undefined>(undefined);

  function AuthProvider({ children }: { children: ReactNode }) {
    const [state, setState] = useState<AuthState>(initialState);
    const isRefreshingRef = useRef(false);

    const applyAuthPayload = useCallback((payload: LoginResponse | null) => {
      if (payload) {
        setState({
          user: payload.user,
          session: payload.session,
          status: 'authenticated',
          error: null,
        });
      } else {
        setState({
          user: null,
          session: null,
          status: 'unauthenticated',
          error: null,
        });
      }
    }, []);

    const refresh = useCallback(async () => {
      if (isRefreshingRef.current) return;
      isRefreshingRef.current = true;
      try {
        const payload = await client.fetchSession();
        applyAuthPayload(payload);
      } catch (error) {
        console.error('Failed to refresh auth session', error);
        setState({
          user: null,
          session: null,
          status: 'unauthenticated',
          error: '无法获取登录状态',
        });
      } finally {
        isRefreshingRef.current = false;
      }
    }, [applyAuthPayload, client]);

    useEffect(() => {
      void refresh();
    }, [refresh]);

    const login = useCallback(
      async (payload: LoginRequest) => {
        setState((prev: AuthState) => ({ ...prev, error: null }));
        try {
          const data = await client.login(payload);
          applyAuthPayload(data);
        } catch (error) {
          const message =
            error instanceof ApiError ? error.message : '登录失败，请稍后再试';
          setState((prev: AuthState) => ({ ...prev, error: message }));
          throw error;
        }
      },
      [applyAuthPayload, client],
    );

    const register = useCallback(
      async (payload: RegisterRequest) => {
        setState((prev: AuthState) => ({ ...prev, error: null }));
        try {
          const registerResponse = await client.register(payload);

          if (registerResponse.session) {
            applyAuthPayload({
              user: registerResponse.user,
              session: registerResponse.session,
            });
            return;
          }

          const loginResponse = await client.login({
            identifier: payload.username,
            password: payload.password,
          });
          applyAuthPayload(loginResponse);
        } catch (error) {
          const message =
            error instanceof ApiError ? error.message : '注册失败，请稍后再试';
          setState((prev: AuthState) => ({ ...prev, error: message }));
          throw error;
        }
      },
      [applyAuthPayload, client],
    );

    const logout = useCallback(async () => {
      try {
        await client.logout();
      } finally {
        setState({
          user: null,
          session: null,
          status: 'unauthenticated',
          error: null,
        });
      }
    }, [client]);

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

    return (
      <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
    );
  }

  const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
      throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
  };

  return {
    AuthContext,
    AuthProvider,
    useAuth,
    authClient: client,
  } as const;
};

export const createAuthContextWithConfig = (config?: AuthClientConfig) =>
  createAuthContext(createAuthClient(config));
