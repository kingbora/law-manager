import {
  AuthUserRoles,
  AuthUserSchema,
  type AuthUserRole,
  SessionSchema,
} from '@law-manager/api-schema/auth';
import { createError } from 'h3';

const toIsoString = (value: unknown): string => {
  const date = value ? new Date(value as string | number | Date) : new Date();
  if (Number.isNaN(date.getTime())) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Invalid date returned from auth provider',
    });
  }
  return date.toISOString();
};

const readDateField = (user: Record<string, unknown>, key: string, fallbackKey: string) =>
  toIsoString(user[key] ?? user[fallbackKey]);

const toBoolean = (value: unknown) => {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value !== 0;
  if (typeof value === 'string') {
    if (value === 'true') return true;
    if (value === 'false') return false;
    const num = Number(value);
    if (!Number.isNaN(num)) {
      return num !== 0;
    }
  }
  return Boolean(value);
};

export const normalizeUser = (user: Record<string, unknown>) => {
  const username = (user.username as string | undefined) ?? (user.name as string | undefined);
  const role =
    (AuthUserRoles.find((item) => item === (user.role as string | undefined)) as
      | AuthUserRole
      | undefined) ?? 'assistant';

  if (!username) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Auth provider did not return a username field.',
    });
  }

  const emailVerifiedRaw =
    user.emailVerified ?? user.email_verified ?? user.isEmailVerified ?? false;

  return AuthUserSchema.parse({
    ...user,
    emailVerified: toBoolean(emailVerifiedRaw),
    username,
    role,
    createdAt: readDateField(user, 'createdAt', 'created_at'),
    updatedAt: readDateField(user, 'updatedAt', 'updated_at'),
  });
};

export const normalizeSession = (session: Record<string, unknown>) =>
  SessionSchema.parse({
    token: session.id,
    expiresAt: toIsoString(session.expiresAt),
  });
