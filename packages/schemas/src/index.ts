import { z } from 'zod';

export const userSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters').max(50),
  age: z.number().min(18, 'Must be at least 18'),
});

export type UserDto = z.infer<typeof userSchema>;
export type { AppRouter } from './@generated/server';
