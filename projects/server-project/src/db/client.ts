import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { URL } from 'node:url';
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

const decodeCertificate = (value: string) => {
  const trimmed = value.trim();
  if (trimmed.startsWith('-----BEGIN')) {
    return trimmed;
  }

  try {
    return Buffer.from(trimmed, 'base64').toString('utf8');
  } catch {
    return trimmed;
  }
};

const loadCertificates = () => {
  const certificates: string[] = [];

  const inlineCertificate = process.env.DATABASE_SSL_CERT;
  if (inlineCertificate) {
    certificates.push(decodeCertificate(inlineCertificate));
  }

  const certificatePath = process.env.DATABASE_SSL_CERT_PATH;
  if (certificatePath) {
    try {
      certificates.push(readFileSync(resolve(certificatePath), 'utf8'));
    } catch (error) {
      throw new Error(
        `Unable to read TLS certificate from DATABASE_SSL_CERT_PATH (${certificatePath}): ${(error as Error).message}`,
      );
    }
  }

  return certificates;
};

const sslConfiguration = () => {
  if (disableSsl) {
    return undefined;
  }

  const certificates = loadCertificates();

  return {
    minVersion: 'TLSv1.2',
    rejectUnauthorized,
    ca: certificates.length > 0 ? certificates : undefined,
  } as const;
};
const normalizedUrl = connectionUri.replace(/^mysqls?:\/\//i, 'mysql://');
const url = new URL(normalizedUrl);

const pool = createPool({
  host: url.hostname,
  port: Number(url.port || '3306'),
  user: decodeURIComponent(url.username),
  password: decodeURIComponent(url.password),
  database: url.pathname.replace(/^\//, ''),
  waitForConnections: true,
  connectionLimit,
  ssl: sslConfiguration(),
});

export const db = drizzle(pool, {
  schema,
  mode: 'default',
});

export { pool, schema };
