import { AuthErrorSchema } from '@law-manager/api-schema/auth';
import { z } from 'zod';

const DEFAULT_BASE_URL = 'http://localhost:4000';
const DEFAULT_PREFIX = '/api';

export const normalizeBase = (value: string | undefined) => {
  if (!value) return DEFAULT_BASE_URL;
  return value.endsWith('/') ? value.slice(0, -1) : value;
};

export const normalizePrefix = (value: string | undefined) => {
  if (!value) return DEFAULT_PREFIX;
  if (!value.startsWith('/')) return `/${value}`;
  return value;
};

export const getApiBaseUrl = () => normalizeBase(process.env.NEXT_PUBLIC_SERVER_BASE_URL);
export const getApiPrefix = () => normalizePrefix(process.env.NEXT_PUBLIC_API_PREFIX);

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

export const buildUrl = (path: string) => {
  const sanitizedPath = path.startsWith('/') ? path.slice(1) : path;
  return `${getApiBaseUrl()}${getApiPrefix()}/${sanitizedPath}`;
};

const extractErrorMessage = (payload: unknown, fallback: string) => {
  if (!payload) return fallback;
  try {
    const parsed = AuthErrorSchema.safeParse(payload);
    if (parsed.success) {
      return parsed.data.details ? `${parsed.data.error}: ${parsed.data.details}` : parsed.data.error;
    }
    if (typeof payload === 'string') {
      return payload;
    }
    if (typeof payload === 'object' && payload && 'message' in payload) {
      return String((payload as { message?: unknown }).message ?? fallback);
    }
  } catch {
    // ignore
  }
  return fallback;
};

export type ApiFetchOptions = RequestInit & {
  schema?: z.ZodTypeAny;
  allowedStatus?: number[];
};

export async function apiFetch<T = unknown>(path: string, options: ApiFetchOptions = {}) {
  const { schema, allowedStatus = [], headers, ...init } = options;

  const requestHeaders = new Headers(headers as HeadersInit | undefined);
  if (init.body && !requestHeaders.has('content-type')) {
    requestHeaders.set('content-type', 'application/json');
  }

  const response = await fetch(buildUrl(path), {
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

    const message = extractErrorMessage(payload, response.statusText || 'Request failed');

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
}
