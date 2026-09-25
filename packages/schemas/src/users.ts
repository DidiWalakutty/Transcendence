import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';
import { users } from '@repo/schemas/database';
import {
  emailField,
  imageField,
  MAX_AVATAR_IMAGE_BYTES,
  nameField,
  NO_AVATAR,
  EVENT_PLACEHOLDER,
  passwordField,
  usernameField,
} from '@repo/schemas/fields';
import { subscriptionSchema } from '@repo/schemas/subscription';

export const userSchema = createSelectSchema(users, {
  createdAt: () => z.coerce.date(),
  updatedAt: () => z.coerce.date(),
  banExpires: () => z.coerce.date().nullable(),
});
export const userCreatedSubscriptionSchema = subscriptionSchema<UserDto>();
export const userUpdatedSubscriptionSchema = subscriptionSchema<UserDto>();
export const userDeletedSubscriptionSchema = subscriptionSchema<UserDto>();

// Unified user lifecycle stream. The admin dashboard used to open three
// separate SSE connections (created/updated/deleted) plus event, presence and
// chat streams, which together exhaust the browser's ~6 connections-per-origin
// limit and leave no slot for mutations — saves then hang forever on
// "Saving changes…". One connection carrying an action discriminator fixes it,
// mirroring the existing eventChanged pattern.
export const userChangedSchema = z.discriminatedUnion('action', [
  z.object({ action: z.literal('created'), user: userSchema }),
  z.object({ action: z.literal('updated'), user: userSchema }),
  z.object({ action: z.literal('deleted'), user: userSchema }),
]);
export const userChangedSubscriptionSchema = subscriptionSchema<UserChangedDto>();

export const supportedLanguages = ['en', 'nl', 'es'] as const;
export type SupportedLanguage = (typeof supportedLanguages)[number];

export const notificationLanguages = ['en', 'nl', 'es'] as const;
export type NotificationLanguage = (typeof notificationLanguages)[number];

export function hasAdminRole(user: { role?: string | null } | null | undefined): boolean {
  return !!user?.role?.split(',').includes('admin');
}

export function resolveUserDisplayName(user: {
  name?: string | null;
  username?: string | null;
}): string {
  return user.name || user.username || 'User';
}

export function getUserLabel(user: {
  displayUsername?: string | null;
  username?: string | null;
  name?: string | null;
}): string {
  return user.displayUsername ?? user.username ?? user.name ?? 'User';
}

export function resolveUserLocale(value: unknown): NotificationLanguage {
  return (notificationLanguages as readonly string[]).includes(value as string)
    ? (value as NotificationLanguage)
    : 'en';
}

export function normalizeUserLanguage(value: unknown): string {
  if (typeof value !== 'string') return '';
  if ((supportedLanguages as readonly string[]).includes(value)) return value;
  // Legacy rows stored the English word instead of the locale code.
  if (value === 'english') return 'en';
  return resolveUserLocale(value);
}

// Defined in fields.ts (no dependencies) so events.ts can use them too.
export { NO_AVATAR, EVENT_PLACEHOLDER };

export function avatarSource(avatar?: string | null): string | undefined {
  return !avatar || avatar === NO_AVATAR ? undefined : avatar;
}

export function eventImageSource(image: string | null | undefined, fallback: string): string {
  return !image || image === EVENT_PLACEHOLDER ? fallback : image;
}

export const createUserSchema = createInsertSchema(users, {
  email: () => emailField,
  name: () => nameField,
  username: () => usernameField,
}).pick({
  email: true,
  name: true,
  username: true,
});

export const updateUserSchema = createUserSchema.partial().extend({
  id: z.uuid(),
  aboutMe: z.string().max(500).optional(),
  location: z.string().max(100).optional(),
  preferedLanguage: z.enum(supportedLanguages).optional(),
  avatar: imageField(NO_AVATAR, MAX_AVATAR_IMAGE_BYTES).optional(),
  displayUsername: z.string().optional(),
});

export const adminUpdateUserSchema = updateUserSchema.extend({
  role: z.enum(['user', 'admin']).optional(),
});

export const deleteUserSchema = z.object({
  id: z.uuid(),
});

export type UserDto = z.infer<typeof userSchema>;
export type UserChangedDto = z.infer<typeof userChangedSchema>;
export type CreateUserDto = z.infer<typeof createUserSchema>;
export type UpdateUserDto = z.infer<typeof updateUserSchema>;
export type AdminUpdateUserDto = z.infer<typeof adminUpdateUserSchema>;
export type DeleteUserDto = z.infer<typeof deleteUserSchema>;

export { passwordField };
