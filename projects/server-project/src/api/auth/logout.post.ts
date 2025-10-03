import { LogoutResponseSchema } from '@law-manager/api-schema/auth';
import { assertMethod, createError, eventHandler } from 'h3';

import { proxyAuthRequest } from '../../auth/proxy';
import { normalizeAuthError } from './utils';

export default eventHandler(async (event) => {
  assertMethod(event, 'POST');

  const response = await proxyAuthRequest<{ success: boolean }>(event, '/sign-out', {
    method: 'POST',
  });

  if (!response.ok) {
    const error = normalizeAuthError(response.data, 'Logout failed');
    throw createError({
      statusCode: response.status,
      statusMessage: error.error,
      data: error,
    });
  }

  return LogoutResponseSchema.parse(response.data);
});
