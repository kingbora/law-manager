import {
  UsernameAvailabilityRequestSchema,
  UsernameAvailabilityResponseSchema,
} from '@law-manager/api-schema/auth';
import { eq } from 'drizzle-orm';
import { assertMethod, eventHandler, readBody } from 'h3';

import { db } from '../../db/client';
import { users } from '../../db/schema';

export default eventHandler(async (event) => {
  assertMethod(event, 'POST');

  const rawBody = await readBody(event);
  const payload = UsernameAvailabilityRequestSchema.parse(rawBody);

  const existing = await db.query.user.findFirst({
    columns: {
      id: true,
    },
    where: eq(users.username, payload.username),
  });

  return UsernameAvailabilityResponseSchema.parse({
    username: payload.username,
    available: !existing,
  });
});
