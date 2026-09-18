import { z } from 'zod';
import { uuidField } from '@repo/schemas/fields';
import { subscriptionSchema } from '@repo/schemas/subscription';

export const presenceChangedSchema = z.object({
  userId: uuidField(),
  online: z.boolean(),
});
export const presenceChangedSubscriptionSchema = subscriptionSchema<PresenceChangedDto>();

export const getOnlineUserIdsSchema = z.object({
  userIds: uuidField().array(),
});

export type PresenceChangedDto = z.infer<typeof presenceChangedSchema>;
export type GetOnlineUserIdsDto = z.infer<typeof getOnlineUserIdsSchema>;
