import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import type { FieldAttribute } from 'better-auth/db';
import { toNodeHandler } from 'better-auth/node';
import { z } from 'zod';
import { db, schema } from '../db/client';

const baseURL =
  process.env.AUTH_BASE_URL ??
  process.env.SERVER_BASE_URL ??
  `http://localhost:${process.env.PORT ?? 4000}`;

const basePath = process.env.AUTH_BASE_PATH ?? '/auth';

const usernameField = {
  type: 'string',
  required: true,
  unique: true,
  fieldName: 'username',
  validator: z
    .string()
    .min(3)
    .max(64)
    .regex(/^[a-zA-Z0-9_-]+$/),
} satisfies FieldAttribute<'string'>;

const ensureNameFromUsername = (user: { name?: string; username?: string }) => {
  if ((!user.name || user.name.length === 0) && user.username) {
    user.name = user.username;
  }
};

const auth = betterAuth({
  appName: 'Law Manager',
  baseURL,
  basePath,
  secret: process.env.AUTH_SECRET,
  database: drizzleAdapter(db, {
    schema,
    provider: 'mysql',
  }),
  user: {
    additionalFields: {
      username: usernameField,
    },
  },
  emailAndPassword: {
    enabled: true,
    minPasswordLength: Number(process.env.AUTH_MIN_PASSWORD_LENGTH ?? 8),
    maxPasswordLength: Number(process.env.AUTH_MAX_PASSWORD_LENGTH ?? 128),
    sendEmailVerificationOnSignUp: process.env.AUTH_SEND_VERIFICATION_ON_SIGNUP === 'true',
  },
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          ensureNameFromUsername(user as unknown as { name?: string; username?: string });
        },
      },
      update: {
        before: async (user) => {
          ensureNameFromUsername(user as unknown as { name?: string; username?: string });
        },
      },
    },
  },
});

export const authHandler = toNodeHandler(auth.handler);
export const authApi = auth.api;
export const authOptions = auth.options;
export const authInstance = auth;
export const authBasePath = basePath;
