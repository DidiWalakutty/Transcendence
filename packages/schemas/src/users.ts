import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';
import { users } from '@repo/schemas/database';

export const userSchema = createSelectSchema(users, {
  createdAt: () => z.coerce.date(),
});
export const userCreatedSubscriptionSchema = z.custom<AsyncIterable<UserDto>>();
export const userUpdatedSubscriptionSchema = z.custom<AsyncIterable<UserDto>>();
export const userDeletedSubscriptionSchema = z.custom<AsyncIterable<UserDto>>();

export const createUserSchema = createInsertSchema(users, {
  email: () => z.email('Must be a valid email address'),
  name: (schema) => schema.min(3, 'Name must be at least 3 characters').max(50),
}).pick({
  email: true,
  name: true,
});

export const updateUserSchema = createUserSchema.extend({
  id: z.uuid(),
});

export const deleteUserSchema = z.object({
  id: z.uuid(),
});

export type UserDto = z.infer<typeof userSchema>;
export type CreateUserDto = z.infer<typeof createUserSchema>;
export type UpdateUserDto = z.infer<typeof updateUserSchema>;
export type DeleteUserDto = z.infer<typeof deleteUserSchema>;
