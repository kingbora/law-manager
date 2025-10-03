import { RegisterRequestSchema, RegisterResponseSchema } from '@law-manager/api-schema/auth';
import { assertMethod, createError, eventHandler, readBody } from 'h3';

import { proxyAuthRequest } from '../../auth/proxy';
import { normalizeAuthError, normalizeSession, normalizeUser } from './utils';

export default eventHandler(async (event) => {
  assertMethod(event, 'POST');

  const rawBody = await readBody(event);
  const payload = RegisterRequestSchema.parse(rawBody);

  const response = await proxyAuthRequest<{
    user: Record<string, unknown>;
    session?: Record<string, unknown>;
  }>(event, '/sign-up/email', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      ...payload,
      name: payload.username,
      role: 'assistant',
    }),
  });

  if (!response.ok) {
    const error = normalizeAuthError(response.data, 'Registration failed');
    throw createError({
      statusCode: response.status,
      statusMessage: error.error,
      data: error,
    });
  }

  const user = normalizeUser(response.data.user);
  const session = response.data.session ? normalizeSession(response.data.session) : undefined;

  return RegisterResponseSchema.parse({
    user,
    session,
  });
});
