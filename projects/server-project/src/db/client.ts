import { drizzle } from 'drizzle-orm/mysql2';
import { createPool } from 'mysql2/promise';
import { schema } from './schema';

const connectionUri = process.env.DATABASE_URL;

if (!connectionUri) {
  throw new Error(
    'DATABASE_URL is required to start the auth server. Set it to your TiDB Cloud connection string.',
  );
}

const connectionLimit = Number(process.env.DATABASE_CONNECTION_LIMIT ?? '5');
const disableSsl = process.env.DATABASE_DISABLE_SSL === 'true';
const rejectUnauthorized = process.env.DATABASE_SSL_REJECT_UNAUTHORIZED !== 'false';

const pool = createPool({
  uri: connectionUri,
  waitForConnections: true,
  connectionLimit,
  ssl: disableSsl
    ? undefined
    : {
      rejectUnauthorized,
    },
});

export const db = drizzle(pool, {
  schema,
  mode: 'default',
});

export { pool, schema };
