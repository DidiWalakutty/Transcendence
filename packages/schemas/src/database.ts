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
  isAdministrator: boolean().notNull().default(false),
  aboutMe: text('about_me'),
  location: text('location'),
  preferedLanguage: text('language').default('english'),
  avatar: text('avatar_link').default('PLACEHOLDER'),
  username: text('username').notNull().unique(),
});

export const events = pgTable('events', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: text('title').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  description: jsonb('description').$type<Record<string, string>>().notNull(),
  image: text('image_link').notNull(),
  organizerId: uuid('organizer_id')
    .notNull()
    .references(() => users.id),
  location: text('location').notNull(),
  dateTime: timestamp('date_time').notNull(),
  maxCapacity: integer('max_capacity').notNull(),
  tags: text('tags').array().notNull(),
});

export const friendshipStatus = pgEnum('friendship_status', ['pending', 'accepted']);
export const registrationStatus = pgEnum('registration_status', ['active', 'canceled']);

export const friends = pgTable('friends', {
  myId: uuid('my_id')
    .notNull()
    .references(() => users.id),
  friendId: uuid('friend_id')
    .notNull()
    .references(() => users.id),
  status: friendshipStatus('f_status').notNull().default('pending'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const registrations = pgTable('registrations', {
  eventId: uuid('event_id')
    .notNull()
    .references(() => events.id),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id),
  status: registrationStatus('r_status').notNull().default('active'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const schema = {
  users,
  events,
  friends,
  registrations,
};

export type User = typeof users.$inferSelect;
export type CreateUser = typeof users.$inferInsert;
export type Event = typeof events.$inferSelect;
export type CreateEvent = typeof events.$inferInsert;
export type friend = typeof friends.$inferSelect;
export type registration = typeof registrations.$inferSelect;
export type createRegistration = typeof registrations.$inferInsert;
