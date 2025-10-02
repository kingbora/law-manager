import {
  LoginRequestSchema,
  LoginResponseSchema,
  LogoutResponseSchema,
  RegisterRequestSchema,
  RegisterResponseSchema,
  type LoginRequest,
  type LoginResponse,
  type LogoutResponse,
  type RegisterRequest,
  type RegisterResponse,
} from '@law-manager/api-schema/auth';

import { apiFetch } from './api-client';

export async function login(payload: LoginRequest): Promise<LoginResponse> {
  const body = LoginRequestSchema.parse(payload);

  return apiFetch<LoginResponse>('auth/login', {
    method: 'POST',
    body: JSON.stringify(body),
    schema: LoginResponseSchema,
  });
}

export async function register(payload: RegisterRequest): Promise<RegisterResponse> {
  const body = RegisterRequestSchema.parse(payload);

  return apiFetch<RegisterResponse>('auth/register', {
    method: 'POST',
    body: JSON.stringify(body),
    schema: RegisterResponseSchema,
  });
}

export async function logout(): Promise<LogoutResponse> {
  return apiFetch<LogoutResponse>('auth/logout', {
    method: 'POST',
    schema: LogoutResponseSchema,
  });
}

export async function fetchSession(): Promise<LoginResponse | null> {
  const payload = await apiFetch<LoginResponse | null>('auth/session', {
    method: 'GET',
    schema: LoginResponseSchema.nullable(),
    allowedStatus: [401],
  });

  return payload;
}
