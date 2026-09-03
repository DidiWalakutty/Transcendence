import {
  pgTable,
  text,
  timestamp,
  jsonb,
  uuid,
  integer,
  boolean,
  pgEnum,
} from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  name: text('name').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  role: text('role').notNull().default('user'),
  banned: boolean('banned').notNull().default(false),
  banReason: text('ban_reason'),
  banExpires: timestamp('ban_expires'),
  aboutMe: text('about_me'),
  location: text('location'),
  preferedLanguage: text('language').default('english'),
  avatar: text('avatar_link').default('PLACEHOLDER'),
  username: text('username').notNull().unique(),
  displayUsername: text('display_username'),
  emailVerified: boolean('email_verified').notNull().default(false),
  twoFactorEnabled: boolean('two_factor_enabled').notNull().default(false),
});

export const sessions = pgTable('sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  token: text('token').notNull().unique(),
  expiresAt: timestamp('expires_at').notNull(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  impersonatedBy: text('impersonated_by'),
});

export const accounts = pgTable('accounts', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  accountId: text('account_id').notNull(),
  providerId: text('provider_id').notNull(),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  idToken: text('id_token'),
  accessTokenExpiresAt: timestamp('access_token_expires_at'),
  refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
  scope: text('scope'),
  password: text('password'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const verifications = pgTable('verifications', {
  id: uuid('id').primaryKey().defaultRandom(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const twoFactors = pgTable('two_factors', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  secret: text('secret').notNull(),
  backupCodes: text('backup_codes').notNull(),
  verified: boolean('verified').notNull().default(true),
  failedVerificationCount: integer('failed_verification_count').notNull().default(0),
  lockedUntil: timestamp('locked_until'),
});

export const events = pgTable('events', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: text('title').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  description: jsonb('description').$type<Record<string, string>>().notNull(),
  image: text('image_link').notNull(),
  organizerId: uuid('organizer_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  location: text('location').notNull(),
  address: text('address').notNull(),
  dateTime: timestamp('date_time').notNull(),
  maxCapacity: integer('max_capacity').notNull(),
  category: text('category').array().notNull(),
});

export const friendshipStatus = pgEnum('friendship_status', ['pending', 'accepted']);
export const registrationStatus = pgEnum('registration_status', ['active', 'canceled']);

export const friends = pgTable('friends', {
  myId: uuid('my_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  friendId: uuid('friend_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  status: friendshipStatus('f_status').notNull().default('pending'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const registrations = pgTable('registrations', {
  eventId: uuid('event_id')
    .notNull()
    .references(() => events.id, { onDelete: 'cascade' }),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  status: registrationStatus('r_status').notNull().default('active'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const schema = {
  users,
  events,
  friends,
  registrations,
  sessions,
  accounts,
  verifications,
  twoFactors,
};

export type User = typeof users.$inferSelect;
export type CreateUser = typeof users.$inferInsert;
export type Event = typeof events.$inferSelect;
export type CreateEvent = typeof events.$inferInsert;
export type friend = typeof friends.$inferSelect;
export type registration = typeof registrations.$inferSelect;
export type createRegistration = typeof registrations.$inferInsert;
export type TwoFactor = typeof twoFactors.$inferSelect;
