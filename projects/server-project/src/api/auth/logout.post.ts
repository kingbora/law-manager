import { LogoutResponseSchema } from '@law-manager/api-schema/auth';
import { assertMethod, createError, eventHandler } from 'h3';

import { proxyAuthRequest } from '../../auth/proxy';

export default eventHandler(async (event) => {
  assertMethod(event, 'POST');

  const response = await proxyAuthRequest<{ success: boolean }>(event, '/sign-out', {
    method: 'POST',
  });

  if (!response.ok) {
    throw createError({
      statusCode: response.status,
      statusMessage: 'Logout failed',
      data: response.data,
    });
  }

  return LogoutResponseSchema.parse(response.data);
});
