import { z } from 'zod';

export const AuthUserRoles = [
  'master',
  'admin',
  'sale',
  'lawyer',
  'assistant',
] as const;

export type AuthUserRole = (typeof AuthUserRoles)[number];

export const AuthUserSchema = z.object({
  id: z.string().min(1),
  email: z.string().email(),
  username: z.string().min(3).max(64),
  emailVerified: z.boolean().default(false),
  role: z.enum(AuthUserRoles),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type AuthUser = z.infer<typeof AuthUserSchema>;

export const SessionSchema = z.object({
  token: z.string().min(1),
  expiresAt: z.string().datetime(),
});

export type Session = z.infer<typeof SessionSchema>;

export const RegisterRequestSchema = z.object({
  email: z.string().email(),
  username: z.string().min(3).max(64),
  password: z.string().min(8).max(128),
});

export type RegisterRequest = z.infer<typeof RegisterRequestSchema>;

export const RegisterResponseSchema = z.object({
  user: AuthUserSchema,
  session: SessionSchema.optional(),
});

export type RegisterResponse = z.infer<typeof RegisterResponseSchema>;

export const LoginRequestSchema = z.object({
  identifier: z.string().min(3).max(128).describe('Username or email'),
  password: z.string().min(8).max(128),
});

export type LoginRequest = z.infer<typeof LoginRequestSchema>;

export const LoginResponseSchema = z.object({
  user: AuthUserSchema,
  session: SessionSchema,
});

export type LoginResponse = z.infer<typeof LoginResponseSchema>;

export const LogoutResponseSchema = z.object({
  success: z.literal(true),
});

export type LogoutResponse = z.infer<typeof LogoutResponseSchema>;

export const AuthErrorSchema = z.object({
  error: z.string().min(1),
  details: z.string().optional(),
});

export type AuthError = z.infer<typeof AuthErrorSchema>;

export const EmailAvailabilityRequestSchema = z.object({
  email: z.string().email(),
});

export type EmailAvailabilityRequest = z.infer<typeof EmailAvailabilityRequestSchema>;

export const EmailAvailabilityResponseSchema = z.object({
  email: z.string().email(),
  available: z.boolean(),
});

export type EmailAvailabilityResponse = z.infer<typeof EmailAvailabilityResponseSchema>;

export const UsernameAvailabilityRequestSchema = z.object({
  username: z.string().min(3).max(64),
});

export type UsernameAvailabilityRequest = z.infer<typeof UsernameAvailabilityRequestSchema>;

export const UsernameAvailabilityResponseSchema = z.object({
  username: z.string().min(3).max(64),
  available: z.boolean(),
});

export type UsernameAvailabilityResponse = z.infer<typeof UsernameAvailabilityResponseSchema>;

export const AuthTokensSchema = z.object({
  accessToken: z.string().min(1),
  refreshToken: z.string().min(1),
});

export type AuthTokens = z.infer<typeof AuthTokensSchema>;

export const LoginSuccessSchema = LoginResponseSchema.extend({
  tokens: AuthTokensSchema.optional(),
});

export type LoginSuccess = z.infer<typeof LoginSuccessSchema>;
