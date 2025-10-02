/// <reference types="node" />

import { defineConfig } from 'drizzle-kit';

if (!process.env.DATABASE_URL) {
  console.warn(
    'DATABASE_URL is not set. Drizzle CLI commands that require a database connection will fail until you provide a TiDB Cloud connection string.',
  );
}

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './src/db/migrations',
  dialect: 'mysql',
  dbCredentials: {
    url: process.env.DATABASE_URL ?? '',
  },
});
