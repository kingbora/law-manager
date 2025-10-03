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

  return AuthUserSchema.parse({
    ...user,
    username,
    role,
    createdAt: toIsoString(user.createdAt),
    updatedAt: toIsoString(user.updatedAt),
  });
};

export const normalizeSession = (session: Record<string, unknown>) =>
  SessionSchema.parse({
    token: session.id,
    expiresAt: toIsoString(session.expiresAt),
  });
