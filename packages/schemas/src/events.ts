import { z } from 'zod';

export const eventSortSchema = z.enum(['upcoming', 'popular', 'newest']);

export const eventSchema = z.object({
  id: z.string(),
  title: z.string(),
  category: z.string().array(),
  location: z.string(),
  address: z.string(),
  date: z.string(),
  image: z.string(),
  description: z.string(),
});

export const eventsSchema = eventSchema.array();

export type EventDto = z.infer<typeof eventSchema>;
export type EventSortDto = z.infer<typeof eventSortSchema>;
