import {
	AuthErrorSchema,
	AuthUser,
	AuthUserRole,
	AuthUserRoles,
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
import { createAuthClient } from 'better-auth/react';
import {
	createContext,
	createElement,
	type PropsWithChildren,
	type ReactElement,
	useCallback,
	useContext,
	useMemo,
	useState,
} from 'react';

type MaybeProcess = { env?: Record<string, string | undefined> };

const DEFAULT_BASE_URL = 'http://localhost:4000';
const DEFAULT_AUTH_PATH = '/auth';
const DEFAULT_API_PREFIX = '/api';

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

const resolveEnvAuthPath = () =>
	readEnv('NEXT_PUBLIC_AUTH_PATH') ??
	readEnv('EXPO_PUBLIC_AUTH_PATH') ??
	readEnv('REACT_APP_AUTH_PATH') ??
	readEnv('AUTH_BASE_PATH') ??
	undefined;

const resolveEnvApiPrefix = () =>
	readEnv('NEXT_PUBLIC_API_PREFIX') ??
	readEnv('EXPO_PUBLIC_API_PREFIX') ??
	readEnv('API_PREFIX') ??
	readEnv('REACT_APP_API_PREFIX') ??
	undefined;

const ensureLeadingSlash = (value: string) => (value.startsWith('/') ? value : `/${value}`);

const stripTrailingSlash = (value: string) =>
	value.length > 1 && value.endsWith('/') ? value.slice(0, -1) : value;

const normalizePathValue = (value: string | undefined, fallback: string) => {
	if (!value) return fallback;
	const trimmed = value.trim();
	if (!trimmed) return fallback;
	return stripTrailingSlash(ensureLeadingSlash(trimmed));
};

export const normalizeBaseUrl = (value: string | undefined) => {
	if (!value) return DEFAULT_BASE_URL;
	const trimmed = value.trim();
	if (!trimmed) return DEFAULT_BASE_URL;
	return trimmed.endsWith('/') ? trimmed.slice(0, -1) : trimmed;
};

export const normalizeBase = (value: string | undefined) => normalizeBaseUrl(value);

export const normalizeAuthPath = (value: string | undefined) => {
	return normalizePathValue(value, DEFAULT_AUTH_PATH);
};

export const normalizePrefix = (value: string | undefined) => normalizePathValue(value, DEFAULT_API_PREFIX);

type ApiClientConfig = {
	baseUrl?: string;
	prefix?: string;
};

const normalizeRoutePath = (value: string | undefined) => normalizePathValue(value, '');

const joinSegments = (baseUrl: string, prefix: string, path: string) => {
	const prefixSegment = prefix === '/' ? '' : prefix;
	const pathSegment = path ? (path.startsWith('/') ? path : `/${path}`) : '';
	if (!pathSegment) {
		return prefixSegment ? `${baseUrl}${prefixSegment}` : `${baseUrl}${prefixSegment || ''}`;
	}
	return `${baseUrl}${prefixSegment}${pathSegment}`;
};

export const createApiClient = (config: ApiClientConfig = {}) => {
	const baseUrl = normalizeBase(config.baseUrl ?? resolveEnvBaseUrl());
	const prefix = normalizePrefix(config.prefix ?? resolveEnvApiPrefix());

	return {
		baseUrl,
		prefix,
		buildUrl: (path: string) => {
			const normalized = normalizeRoutePath(path);
			if (!normalized) {
				return joinSegments(baseUrl, prefix, '');
			}
			return joinSegments(baseUrl, prefix, normalized);
		},
	};
};

const buildAuthBasePath = (prefix: string, authPath?: string) => {
	const normalizedPrefix = normalizePrefix(prefix);
	const normalizedAuth = normalizeAuthPath(authPath);
	if (
		normalizedAuth === normalizedPrefix ||
		normalizedAuth.startsWith(`${normalizedPrefix}/`)
	) {
		return normalizedAuth;
	}
	if (normalizedPrefix === '/') {
		return normalizedAuth;
	}
	if (normalizedAuth === '/') {
		return normalizedPrefix;
	}
	return normalizeAuthPath(`${normalizedPrefix}${normalizedAuth}`);
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

type BetterAuthClientInstance = ReturnType<typeof createAuthClient>;
type SignResult = Awaited<ReturnType<BetterAuthClientInstance["signIn"]["email"]>>;
type SignUpResult = Awaited<ReturnType<BetterAuthClientInstance["signUp"]["email"]>>;
type SignOutResult = Awaited<ReturnType<BetterAuthClientInstance["signOut"]>>;

type AnyRecord = Record<string, unknown>;

const toIsoString = (value: unknown) => {
	const date = value ? new Date(value as string | number | Date) : null;
	if (!date || Number.isNaN(date.getTime())) {
		throw new Error('Invalid date value returned from auth provider');
	}
	return date.toISOString();
};

const toBoolean = (value: unknown) => {
	if (typeof value === 'boolean') return value;
	if (typeof value === 'number') return value !== 0;
	if (typeof value === 'string') {
		if (value === 'true') return true;
		if (value === 'false') return false;
		const numeric = Number(value);
		if (!Number.isNaN(numeric)) {
			return numeric !== 0;
		}
	}
	return Boolean(value);
};

const normalizeBetterAuthUser = (user: AnyRecord): AuthUser => {
	const id = typeof user.id === 'string' ? user.id : undefined;
	const email = typeof user.email === 'string' ? user.email : undefined;
	const usernameRaw =
		typeof user.username === 'string' && user.username.length > 0
			? user.username
			: typeof user.name === 'string' && user.name.length > 0
				? user.name
				: undefined;

	if (!id) {
		throw new Error('Auth provider did not return a valid user id');
	}

	if (!email) {
		throw new Error('Auth provider did not return a valid email address');
	}

	if (!usernameRaw) {
		throw new Error('Auth provider did not return a username field');
	}

	const roleRaw = typeof user.role === 'string' ? user.role : undefined;
	const role: AuthUserRole = AuthUserRoles.includes(roleRaw as AuthUserRole)
		? (roleRaw as AuthUserRole)
		: 'assistant';

	const emailVerifiedRaw =
		user.emailVerified ?? user.email_verified ?? user.isEmailVerified ?? false;

	const createdAtRaw = user.createdAt ?? user.created_at;
	const updatedAtRaw = user.updatedAt ?? user.updated_at;

	return {
		id,
		email,
		username: usernameRaw,
		emailVerified: toBoolean(emailVerifiedRaw),
		role,
		createdAt: toIsoString(createdAtRaw),
		updatedAt: toIsoString(updatedAtRaw),
	} satisfies AuthUser;
};

const normalizeBetterAuthSession = (session: AnyRecord): Session => {
	const token =
		(typeof session.id === 'string' && session.id.length > 0 ? session.id : undefined) ??
		(typeof session.sessionToken === 'string' && session.sessionToken.length > 0
			? session.sessionToken
			: undefined) ??
		(typeof session.token === 'string' && session.token.length > 0 ? session.token : undefined);

	if (!token) {
		throw new Error('Auth provider did not return a session token');
	}

	return {
		token,
		expiresAt: toIsoString(session.expiresAt ?? session.expires_at),
	} satisfies Session;
};

const buildLoginResponse = (payload: unknown): LoginResponse | null => {
	if (!payload || typeof payload !== 'object') return null;
	const source = payload as { user?: AnyRecord; session?: AnyRecord };
	if (!source.user || !source.session) return null;

	try {
		return LoginResponseSchema.parse({
			user: normalizeBetterAuthUser(source.user as AnyRecord),
			session: normalizeBetterAuthSession(source.session as AnyRecord),
		});
	} catch (error) {
		console.error('Failed to normalize login response', error, payload);
		return null;
	}
};

const buildRegisterResponse = (payload: unknown): RegisterResponse | null => {
	if (!payload || typeof payload !== 'object') return null;
	const source = payload as { user?: AnyRecord; session?: AnyRecord };
	if (!source.user) return null;

	try {
		return RegisterResponseSchema.parse({
			user: normalizeBetterAuthUser(source.user as AnyRecord),
			...(source.session ? { session: normalizeBetterAuthSession(source.session as AnyRecord) } : {}),
		});
	} catch (error) {
		console.error('Failed to normalize register response', error, payload);
		return null;
	}
};

const extractErrorMessage = (payload: unknown, fallback: string): string => {
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

	if (payload instanceof Error && payload.message) {
		return payload.message;
	}

	if (typeof payload === 'object') {
		if ('message' in payload && typeof (payload as { message?: unknown }).message === 'string') {
			return (payload as { message?: string }).message ?? fallback;
		}

		if ('error' in payload && typeof (payload as { error?: unknown }).error === 'string') {
			const value = payload as { error: string; details?: unknown; message?: unknown };
			const detail = typeof value.details === 'string' ? value.details : undefined;
			return detail ? `${value.error}: ${detail}` : value.error;
		}
	}

	return fallback;
};

const toApiError = (error: unknown, fallback: string): ApiError => {
	if (!error) {
		return new ApiError(fallback, 400, null);
	}

	if (error instanceof ApiError) {
		return error;
	}

	const status =
		typeof (error as { status?: unknown }).status === 'number'
			? ((error as { status?: number }).status as number)
			: typeof (error as { response?: { status?: unknown } }).response?.status === 'number'
				? (((error as { response?: { status?: number } }).response?.status as number) ?? 400)
				: 400;

	const payload =
		(error as { data?: unknown }).data ??
		(error as { response?: unknown }).response ??
		(error as { body?: unknown }).body ??
		error;

	const messageBase =
		typeof (error as { message?: unknown }).message === 'string'
			? ((error as { message?: string }).message as string)
			: fallback;

	const extracted = extractErrorMessage(payload, messageBase);

	return new ApiError(extracted, Number.isFinite(status) ? status : 400, payload);
};

const signInWithIdentifier = async (
	client: BetterAuthClientInstance,
	identifier: string,
	password: string,
): Promise<SignResult> => {
	const trimmedIdentifier = identifier.trim();
	const isEmail = trimmedIdentifier.includes('@');
	const signIn = client.signIn as Record<string, (...args: any[]) => Promise<SignResult>>;

	if (!isEmail) {
		const signInByUsername = signIn?.username;
		if (typeof signInByUsername === 'function') {
			try {
				const usernameResult = await signInByUsername({
					username: trimmedIdentifier,
					password,
				});
				if (!usernameResult?.error) {
					return usernameResult;
				}

				const status = (usernameResult.error as { status?: number })?.status;
				if (status && status !== 404 && status !== 400) {
					return usernameResult;
				}
			} catch (error) {
				const status = (error as { status?: number })?.status ?? 500;
				if (status !== 404) {
					throw error;
				}
			}
		}
	}

	const signInByEmail = signIn?.email;
	if (typeof signInByEmail !== 'function') {
		throw new ApiError('登录失败，请稍后再试', 500, null);
	}

	return signInByEmail({
		email: trimmedIdentifier.toLowerCase(),
		password,
	});
};

const signUpWithEmail = async (
	client: BetterAuthClientInstance,
	payload: RegisterRequest,
): Promise<SignUpResult> => {
	const signUp = client.signUp as Record<string, (...args: any[]) => Promise<SignUpResult>>;
	const signUpByEmail = signUp?.email;
	if (typeof signUpByEmail !== 'function') {
		throw new ApiError('注册失败，请稍后再试', 500, null);
	}

	return signUpByEmail({
		email: payload.email.toLowerCase(),
		password: payload.password,
		name: payload.username,
		username: payload.username,
	});
};

const defaultApiClient = createApiClient();
const defaultAuthPath = buildAuthBasePath(defaultApiClient.prefix, resolveEnvAuthPath());

export const authClient: BetterAuthClientInstance = createAuthClient({
	baseURL: defaultApiClient.baseUrl,
	basePath: defaultAuthPath,
	fetchOptions: {
		credentials: 'include',
	},
});

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

export type UseAuthReturn = {
	user: AuthUser | null;
	session: Session | null;
	status: AuthStatus;
	error: string | null;
	isPending: boolean;
	login: (payload: LoginRequest) => Promise<LoginResponse>;
	register: (payload: RegisterRequest) => Promise<RegisterResponse>;
	logout: () => Promise<LogoutResponse>;
	refresh: () => Promise<void>;
};

const createUseAuth = (client: BetterAuthClientInstance) => (): UseAuthReturn => {
	const {
		data: rawSession,
		error: sessionError,
		isPending,
		refetch,
	} = client.useSession();

	const [operationError, setOperationError] = useState<string | null>(null);

	const normalizedSession = useMemo(() => buildLoginResponse(rawSession), [rawSession]);

	const status: AuthStatus = useMemo(() => {
		if (isPending) return 'loading';
		return normalizedSession ? 'authenticated' : 'unauthenticated';
	}, [isPending, normalizedSession]);

	const sessionErrorMessage = useMemo(() => {
		if (!sessionError) return null;

		const payload =
			(sessionError as { data?: unknown }).data ??
			(sessionError as { response?: unknown }).response ??
			sessionError;

		return extractErrorMessage(payload, '无法获取登录状态');
	}, [sessionError]);

	const login = useCallback(
		async (input: LoginRequest) => {
			const payload = LoginRequestSchema.parse(input);
			setOperationError(null);

			try {
				const result = await signInWithIdentifier(client, payload.identifier, payload.password);
				if (result?.error) {
					throw toApiError(result.error, '登录失败，请稍后再试');
				}

				const normalized = buildLoginResponse(result?.data);
				if (!normalized) {
					refetch?.();
					throw new ApiError('登录失败，请稍后再试', 500, result?.data);
				}

				refetch?.();
				return normalized;
			} catch (error) {
				const apiError = toApiError(error, '登录失败，请稍后再试');
				setOperationError(apiError.message);
				throw apiError;
			}
		},
		[client, refetch],
	);

	const register = useCallback(
		async (input: RegisterRequest) => {
			const payload = RegisterRequestSchema.parse(input);
			setOperationError(null);

			try {
				const result = await signUpWithEmail(client, payload);
				if (result?.error) {
					throw toApiError(result.error, '注册失败，请稍后再试');
				}

				const normalized = buildRegisterResponse(result?.data);
				if (normalized?.session) {
					refetch?.();
					return normalized;
				}

				const loginResult = await signInWithIdentifier(client, payload.email, payload.password);
				if (loginResult?.error) {
					throw toApiError(loginResult.error, '注册失败，请稍后再试');
				}

				const resolved =
					buildRegisterResponse(loginResult?.data) ??
					buildRegisterResponse({
						user: normalized?.user,
						session: (loginResult?.data as AnyRecord)?.session,
					}) ??
					null;

				if (resolved) {
					refetch?.();
					return resolved;
				}

				throw new ApiError('注册失败，请稍后再试', 500, loginResult?.data);
			} catch (error) {
				const apiError = toApiError(error, '注册失败，请稍后再试');
				setOperationError(apiError.message);
				throw apiError;
			}
		},
		[client, refetch],
	);

	const logout = useCallback(async () => {
		setOperationError(null);

		try {
			const result: SignOutResult = await client.signOut();
			if (result?.error) {
				throw toApiError(result.error, '注销失败，请稍后再试');
			}

			const parsed = LogoutResponseSchema.safeParse(result?.data ?? { success: true });
			refetch?.();
			if (parsed.success) {
				return parsed.data;
			}

			return LogoutResponseSchema.parse({ success: true });
		} catch (error) {
			const apiError = toApiError(error, '注销失败，请稍后再试');
			setOperationError(apiError.message);
			throw apiError;
		}
	}, [client, refetch]);

	const refresh = useCallback(async () => {
		setOperationError(null);
		refetch?.();
	}, [refetch]);

	const combinedError = operationError ?? sessionErrorMessage;

	return {
		user: normalizedSession?.user ?? null,
		session: normalizedSession?.session ?? null,
		status,
		error: combinedError,
		isPending,
		login,
		register,
		logout,
		refresh,
	};
};

export const useAuth = createUseAuth(authClient);
export const createUseAuthHook = createUseAuth;

type AuthContextConfig = ApiClientConfig & {
	authPath?: string;
};

type AuthContextFactoryResult = {
	AuthProvider: (props: PropsWithChildren) => ReactElement & {
    children?: React.ReactNode;
  };
	useAuth: () => UseAuthReturn;
	authClient: BetterAuthClientInstance;
	apiClient: ReturnType<typeof createApiClient>;
};

export const createAuthContextWithConfig = (
	config: AuthContextConfig = {},
): AuthContextFactoryResult => {
	const apiClient = createApiClient({
		baseUrl: config.baseUrl,
		prefix: config.prefix,
	});

	const authPath = buildAuthBasePath(
		apiClient.prefix,
		config.authPath ?? resolveEnvAuthPath(),
	);

	const client = createAuthClient({
		baseURL: apiClient.baseUrl,
		basePath: authPath,
		fetchOptions: {
			credentials: 'include',
		},
	});

	const useAuthHook = createUseAuth(client);
	const AuthContext = createContext<UseAuthReturn | null>(null);

	const AuthProvider = ({ children }: PropsWithChildren): ReactElement => {
		const value = useAuthHook();
		return createElement(AuthContext.Provider, { value }, children);
	};

	const useAuthFromContext = () => {
		const value = useContext(AuthContext);
		if (!value) {
			throw new Error('useAuth must be used within the provided AuthProvider');
		}
		return value;
	};

	return {
		AuthProvider,
		useAuth: useAuthFromContext,
		authClient: client,
		apiClient,
	};
};

export type { AuthContextConfig, AuthContextFactoryResult };