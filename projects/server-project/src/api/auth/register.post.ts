import { RegisterRequestSchema, RegisterResponseSchema } from '@law-manager/api-schema/auth';
import { assertMethod, createError, eventHandler, readBody } from 'h3';

import { proxyAuthRequest } from '../../auth/proxy';
import { normalizeUser } from './utils';

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
    }),
  });

  if (!response.ok) {
    throw createError({
      statusCode: response.status,
      statusMessage: 'Registration failed',
      data: response.data,
    });
  }

  const user = normalizeUser(response.data.user);

  return RegisterResponseSchema.parse({ user });
});
