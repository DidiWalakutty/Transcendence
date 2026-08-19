import { z } from 'zod';

export const eventStatsSchema = z.object({
  eventCount: z.number(),
  locationCount: z.number(),
  categoryCount: z.number(),
});

export type EventStatsDto = z.infer<typeof eventStatsSchema>;
