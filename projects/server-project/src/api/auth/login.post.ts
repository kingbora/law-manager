import { LoginRequestSchema, LoginResponseSchema } from '@law-manager/api-schema/auth';
import { eq } from 'drizzle-orm';
import { assertMethod, createError, eventHandler, readBody } from 'h3';

import { proxyAuthRequest } from '../../auth/proxy';
import { db } from '../../db/client';
import { users } from '../../db/schema';
import { normalizeSession, normalizeUser } from './utils';

export default eventHandler(async (event) => {
  assertMethod(event, 'POST');

  const rawBody = await readBody(event);
  const payload = LoginRequestSchema.parse(rawBody);

  let email = payload.identifier;

  if (!payload.identifier.includes('@')) {
    const user = await db.query.user.findFirst({
      where: eq(users.username, payload.identifier),
    });

    if (!user) {
      throw createError({
        statusCode: 404,
        statusMessage: 'User not found',
      });
    }

    email = user.email;
  }

  const response = await proxyAuthRequest<{
    user: Record<string, unknown>;
    session: Record<string, unknown>;
    redirect?: boolean;
    url?: string;
  }>(event, '/sign-in/email', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      email,
      password: payload.password,
    }),
  });

  if (!response.ok) {
    throw createError({
      statusCode: response.status,
      statusMessage: 'Login failed',
      data: response.data,
    });
  }

  const user = normalizeUser(response.data.user);
  const session = normalizeSession(response.data.session);

  return LoginResponseSchema.parse({ user, session });
});
