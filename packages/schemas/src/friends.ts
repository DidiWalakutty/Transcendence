import { createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';
import { friends } from '@repo/schemas/database';

export const friendSchema = createSelectSchema(friends, {
  createdAt: () => z.coerce.date(),
});

export const addFriendSchema = z.object({
  friendId: z.uuid(),
});

export const respondFriendSchema = z.object({
  myId: z.uuid(),
  friendId: z.uuid(),
  accept: z.boolean(),
});

export const removeFriendSchema = z.object({
  friendId: z.uuid(),
});

export type FriendDto = z.infer<typeof friendSchema>;
export type AddFriendDto = z.infer<typeof addFriendSchema>;
export type RespondFriendDto = z.infer<typeof respondFriendSchema>;
export type RemoveFriendDto = z.infer<typeof removeFriendSchema>;
