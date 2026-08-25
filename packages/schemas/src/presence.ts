import { z } from 'zod';

export const presenceChangedSchema = z.object({
  userId: z.uuid(),
  online: z.boolean(),
});
export const presenceChangedSubscriptionSchema = z.custom<AsyncIterable<PresenceChangedDto>>();

export const getOnlineUserIdsSchema = z.object({
  userIds: z.uuid().array(),
});

export type PresenceChangedDto = z.infer<typeof presenceChangedSchema>;
export type GetOnlineUserIdsDto = z.infer<typeof getOnlineUserIdsSchema>;
