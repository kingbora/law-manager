import {
  EmailAvailabilityRequestSchema,
  EmailAvailabilityResponseSchema,
} from '@law-manager/api-schema/auth';
import { eq } from 'drizzle-orm';
import { assertMethod, eventHandler, readBody } from 'h3';

import { db } from '../../db/client';
import { users } from '../../db/schema';

export default eventHandler(async (event) => {
  assertMethod(event, 'POST');

  const rawBody = await readBody(event);
  const payload = EmailAvailabilityRequestSchema.parse(rawBody);

  const existing = await db.query.user.findFirst({
    columns: {
      id: true,
    },
    where: eq(users.email, payload.email),
  });

  return EmailAvailabilityResponseSchema.parse({
    email: payload.email,
    available: !existing,
  });
});
