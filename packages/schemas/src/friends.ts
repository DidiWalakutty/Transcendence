import { createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';
import { friends } from '@repo/schemas/database';
import { uuidField } from '@repo/schemas/fields';

export const friendSchema = createSelectSchema(friends, {
  createdAt: () => z.coerce.date(),
});

export function isSamePair(
  a: { myId: string; friendId: string },
  myId: string,
  friendId: string,
): boolean {
  return (
    (a.myId === myId && a.friendId === friendId) || (a.myId === friendId && a.friendId === myId)
  );
}

export const addFriendSchema = z.object({
  friendId: uuidField(),
});

export const respondFriendSchema = z.object({
  myId: uuidField(),
  friendId: uuidField(),
  accept: z.boolean(),
});

export const removeFriendSchema = z.object({
  friendId: uuidField(),
});

export const searchEligibleUsersSchema = z.object({
  search: z.string().trim().max(200).optional(),
});

export const eligibleUserSchema = z.object({
  id: z.string(),
  username: z.string(),
  displayUsername: z.string().nullable().optional(),
  name: z.string().nullable().optional(),
  avatar: z.string().nullable().optional(),
});

export type FriendDto = z.infer<typeof friendSchema>;
export type AddFriendDto = z.infer<typeof addFriendSchema>;
export type RespondFriendDto = z.infer<typeof respondFriendSchema>;
export type RemoveFriendDto = z.infer<typeof removeFriendSchema>;
export type EligibleUserDto = z.infer<typeof eligibleUserSchema>;
export type SearchEligibleUsersDto = z.infer<typeof searchEligibleUsersSchema>;
