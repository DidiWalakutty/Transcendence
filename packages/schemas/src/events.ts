import { z } from 'zod';

export const eventSortSchema = z.enum(['upcoming', 'popular', 'newest']);

// Existing events - used when reading/listing events
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

// Creating a new event - used as  mutation input
export const createEventSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  category: z.array(z.string()).min(1),
  location: z.string().min(1),
  address: z.string().min(1),
  dateTime: z.string(),
  image: z.string().min(1),
  maxCapacity: z.number().int().positive(),
});

export type EventDto = z.infer<typeof eventSchema>;
export type EventSortDto = z.infer<typeof eventSortSchema>;
export type CreateEventDto = z.infer<typeof createEventSchema>;
