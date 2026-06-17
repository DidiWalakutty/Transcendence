import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';
import { users } from '@repo/schemas/database';

export const userSchema = createSelectSchema(users);

export const createUserSchema = createInsertSchema(users, {
  email: (schema) => schema.email('Must be a valid email address'),
  name: (schema) => schema.min(3, 'Name must be at least 3 characters').max(50),
}).pick({
  email: true,
  name: true,
});

export type UserDto = z.infer<typeof userSchema>;
export type CreateUserDto = z.infer<typeof createUserSchema>;
