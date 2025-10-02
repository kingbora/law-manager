import { LoginResponseSchema } from '@law-manager/api-schema/auth';
import { assertMethod, createError, eventHandler } from 'h3';

import { proxyAuthRequest } from '../../auth/proxy';
import { normalizeSession, normalizeUser } from './utils';

type SessionPayload = {
  user: Record<string, unknown>;
  session: Record<string, unknown>;
} | null;

export default eventHandler(async (event) => {
  assertMethod(event, 'GET');

  const response = await proxyAuthRequest<SessionPayload>(event, '/session', {
    method: 'GET',
  });

  if (response.status === 401) {
    return null;
  }

  if (!response.ok) {
    throw createError({
      statusCode: response.status,
      statusMessage: 'Failed to fetch session',
      data: response.data,
    });
  }

  if (!response.data) {
    return null;
  }

  const payload = {
    user: normalizeUser(response.data.user),
    session: normalizeSession(response.data.session),
  };

  return LoginResponseSchema.parse(payload);
});
