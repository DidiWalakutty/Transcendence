import { z } from 'zod';

export const eventSortSchema = z.enum(['upcoming', 'popular', 'newest']);

// Reading an events
export const eventSchema = z.object({
  id: z.string(),
  title: z.string(),
  category: z.string().array(),
  location: z.string(),
  address: z.string(),
  date: z.string(),
  time: z.string(),
  image: z.string(),
  description: z.string(),
  maxCapacity: z.number().int().positive(),
});

// Array of events - used when reading/listing events
export const eventsSchema = eventSchema.array();

// Single event - used when reading a single event
export const eventIdSchema = z.object({
  id: z.string(),
});

// Creating a new event - used as  mutation input
export const createEventSchema = z.object({
  title: z.string().min(1),
  category: z.array(z.string()).min(1),
  location: z.string().min(1),
  address: z.string().min(1),
  date: z.string(),
  time: z.string(),
  image: z.string().min(1),
  description: z.string().min(1),
  maxCapacity: z.number().int().positive(),
});

export type EventDto = z.infer<typeof eventSchema>;
export type EventSortDto = z.infer<typeof eventSortSchema>;
export type CreateEventDto = z.infer<typeof createEventSchema>;
