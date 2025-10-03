/// <reference types="node" />
import 'dotenv/config';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { URL } from 'node:url';

import { defineConfig } from 'drizzle-kit';

if (!process.env.DATABASE_URL) {
  console.warn(
    'DATABASE_URL is not set. Drizzle CLI commands that require a database connection will fail until you provide a TiDB Cloud connection string.',
  );
}

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

const buildDbCredentials = () => {
  const connectionUri = process.env.DATABASE_URL;
  if (!connectionUri) {
    return {
      url: '',
    } as const;
  }

  const normalizedUrl = connectionUri.replace(/^mysqls?:\/\//i, 'mysql://');
  const url = new URL(normalizedUrl);

  const ssl = disableSsl
    ? undefined
    : (() => {
        const certificates = loadCertificates();
        return {
          minVersion: 'TLSv1.2',
          rejectUnauthorized,
          ca: certificates.length > 0 ? certificates : undefined,
        };
      })();

  return {
    host: url.hostname,
    port: Number(url.port || '3306'),
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    database: url.pathname.replace(/^\//, ''),
    ssl,
  } as const;
};

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './src/db/migrations',
  dialect: 'mysql',
  dbCredentials: buildDbCredentials(),
});
