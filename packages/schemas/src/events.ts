import { z } from 'zod';
import { subscriptionSchema } from '@repo/schemas/subscription';

export const eventCategories = ['music', 'culture', 'food', 'games', 'talks', 'workshops'] as const;
export type EventCategory = (typeof eventCategories)[number];
export const eventCategorySchema = z.enum(eventCategories);

export const eventSortSchema = z.enum(['upcoming', 'popular', 'newest']);

// Filtered/paginated listing query. `getEvents` keeps its legacy enum input for
// backwards compatibility; new callers should use this object so filtering,
// search and pagination happen in the backend instead of the browser.
export const getEventsQuerySchema = z.object({
  sort: eventSortSchema.default('upcoming'),
  categories: z.array(eventCategorySchema).optional(),
  search: z.string().trim().max(200).optional(),
  page: z.number().int().positive().default(1),
  pageSize: z.number().int().positive().max(100).default(8),
});

// Reading an events
export const eventSchema = z.object({
  id: z.string(),
  organizerId: z.string().optional(),
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

export const paginatedEventsSchema = z.object({
  items: eventSchema.array(),
  total: z.number().int().nonnegative(),
});

export const eventWithAttendeeCountSchema = eventSchema.extend({
  attendeeCount: z.number().int().nonnegative(),
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
  category: z.array(eventCategorySchema).min(1),
  location: z.string().min(1),
  address: z.string().min(1),
  date: z.string(),
  time: z.string(),
  image: z.string().min(1),
  description: z.string().min(1),
  maxCapacity: z.number().int().positive(),
});

export const updateEventSchema = createEventSchema.extend({
  id: z.string().uuid(),
});

export const deleteEventSchema = z.object({
  id: z.string().uuid(),
});

export const createEventResultSchema = z.object({
  eventId: z.string().uuid(),
});

// Realtime: one message per create/update/delete, broadcast to every client,
// plus a periodic heartbeat. The heartbeat carries no event; it exists so a
// client can tell an idle stream from a dead one, and so idle connections are
// not dropped by proxies.
export const eventChangedSchema = z.discriminatedUnion('action', [
  z.object({ action: z.literal('created'), event: eventSchema }),
  z.object({ action: z.literal('updated'), event: eventSchema }),
  z.object({ action: z.literal('deleted'), event: eventSchema }),
  z.object({ action: z.literal('heartbeat') }),
]);

export const EVENT_HEARTBEAT_INTERVAL_MS = 10_000;

// An event's date and time cross the wire as the wall-clock strings the organiser
// typed, and the column behind them is a `timestamp` with no zone — a naive wall
// clock. Encoding and decoding must therefore agree on how to read that clock.
// They previously did not: writes parsed as local time while reads formatted with
// `toISOString()`, so every event came back shifted by the server's UTC offset
// (18:00 entered in Amsterdam read back as 16:00). Containers run UTC, which made
// the shift invisible in Docker and visible only on a developer's machine.
export function toEventDateTime(date: string, time: string): Date {
  return new Date(`${date}T${time}`);
}

export function fromEventDateTime(dateTime: Date): { date: string; time: string } {
  const pad = (value: number) => String(value).padStart(2, '0');

  return {
    date: `${dateTime.getFullYear()}-${pad(dateTime.getMonth() + 1)}-${pad(dateTime.getDate())}`,
    time: `${pad(dateTime.getHours())}:${pad(dateTime.getMinutes())}`,
  };
}

// tRPC v11 subscriptions type `output` as the yielded item; nestjs-trpc wraps
// it as an AsyncIterable, so this must not be the top-level entity schema.
export const eventChangedSubscriptionSchema = subscriptionSchema<EventChangedDto>();

export const EVENT_HEARTBEAT_STALE_MULTIPLIER = 2.5;
export const EVENT_WATCHDOG_INTERVAL_MS = 5_000;
export const EVENT_STALE_AFTER_MS = EVENT_HEARTBEAT_INTERVAL_MS * EVENT_HEARTBEAT_STALE_MULTIPLIER;

export function parseEventDate(value: string): Date | undefined {
  const [y, m, d] = value.split('-').map(Number);
  if (!y || !m || !d) return undefined;
  return new Date(y, m - 1, d);
}

export function formatEventDate(date: Date): string {
  return fromEventDateTime(date).date;
}

export const MAX_EVENT_IMAGE_BYTES = 72 * 1024;
export const MAX_AVATAR_IMAGE_BYTES = 48 * 1024;
export const MAX_SOURCE_IMAGE_SIZE = 10 * 1024 * 1024;

export type EventDto = z.infer<typeof eventSchema>;
export type EventSortDto = z.infer<typeof eventSortSchema>;
export type GetEventsQueryDto = z.infer<typeof getEventsQuerySchema>;
export type PaginatedEventsDto = z.infer<typeof paginatedEventsSchema>;
export type EventWithAttendeeCountDto = z.infer<typeof eventWithAttendeeCountSchema>;
export type CreateEventDto = z.infer<typeof createEventSchema>;
export type UpdateEventDto = z.infer<typeof updateEventSchema>;
export type DeleteEventDto = z.infer<typeof deleteEventSchema>;
export type EventChangedDto = z.infer<typeof eventChangedSchema>;
