import { createAuthContextWithConfig } from '@law-manager/auth-client';

const auth = createAuthContextWithConfig({
  baseUrl: process.env.EXPO_PUBLIC_SERVER_BASE_URL,
  prefix: process.env.EXPO_PUBLIC_API_PREFIX,
});

export const AuthProvider = auth.AuthProvider;
export const useAuth = auth.useAuth;
export const authClient = auth.authClient;
