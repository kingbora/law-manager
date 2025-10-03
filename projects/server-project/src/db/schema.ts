import { sql } from 'drizzle-orm';
import {
  bigint,
  boolean,
  datetime,
  index,
  int,
  mysqlEnum,
  mysqlTable,
  timestamp,
  uniqueIndex,
  varchar,
} from 'drizzle-orm/mysql-core';

export const users = mysqlTable(
  'users',
  {
    id: varchar('id', { length: 255 }).primaryKey(),
    email: varchar('email', { length: 255 }).notNull(),
    emailVerified: boolean('email_verified').default(false).notNull(),
    username: varchar('username', { length: 64 }).notNull(),
    name: varchar('name', { length: 255 }).notNull(),
    image: varchar('image', { length: 512 }),
    role: mysqlEnum('role', ['master', 'admin', 'sale', 'lawyer', 'assistant'])
      .default('assistant')
      .notNull(),
    createdAt: timestamp('created_at', { mode: 'date', fsp: 3 })
      .default(sql`CURRENT_TIMESTAMP(3)`)
      .notNull(),
    updatedAt: timestamp('updated_at', { mode: 'date', fsp: 3 })
      .default(sql`CURRENT_TIMESTAMP(3)`)
      .onUpdateNow()
      .notNull(),
  },
  (table) => ({
    emailIdx: uniqueIndex('users_email_unique').on(table.email),
    usernameIdx: uniqueIndex('users_username_unique').on(table.username),
  }),
);

export const accounts = mysqlTable(
  'accounts',
  {
    id: varchar('id', { length: 255 }).primaryKey(),
    providerId: varchar('provider_id', { length: 255 }).notNull(),
    accountId: varchar('account_id', { length: 255 }).notNull(),
    userId: varchar('user_id', { length: 255 })
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    accessToken: varchar('access_token', { length: 1024 }),
    refreshToken: varchar('refresh_token', { length: 1024 }),
    idToken: varchar('id_token', { length: 1024 }),
    expiresAt: datetime('expires_at', { mode: 'date', fsp: 3 }),
    password: varchar('password', { length: 255 }),
  },
  (table) => ({
    providerAccountIdx: uniqueIndex('accounts_provider_account_unique').on(
      table.providerId,
      table.accountId,
    ),
    userIdx: index('accounts_user_idx').on(table.userId),
  }),
);

export const sessions = mysqlTable(
  'sessions',
  {
    id: varchar('id', { length: 255 }).primaryKey(),
    userId: varchar('user_id', { length: 255 })
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    expiresAt: datetime('expires_at', { mode: 'date', fsp: 3 }).notNull(),
    ipAddress: varchar('ip_address', { length: 255 }),
    userAgent: varchar('user_agent', { length: 1024 }),
  },
  (table) => ({
    userIdx: index('sessions_user_idx').on(table.userId),
    expiresIdx: index('sessions_expires_idx').on(table.expiresAt),
  }),
);

export const verifications = mysqlTable(
  'verifications',
  {
    id: varchar('id', { length: 255 }).primaryKey(),
    identifier: varchar('identifier', { length: 255 }).notNull(),
    value: varchar('value', { length: 255 }).notNull(),
    expiresAt: datetime('expires_at', { mode: 'date', fsp: 3 }).notNull(),
  },
  (table) => ({
    identifierIdx: uniqueIndex('verifications_identifier_unique').on(table.identifier),
  }),
);

export const rateLimit = mysqlTable('rate_limit', {
  key: varchar('key', { length: 255 }).primaryKey(),
  count: int('count').notNull().default(0),
  lastRequest: bigint('last_request', { mode: 'number' }).notNull().default(0),
});

export const schema = {
  user: users,
  account: accounts,
  session: sessions,
  verification: verifications,
  rateLimit,
};

export type Schema = typeof schema;
