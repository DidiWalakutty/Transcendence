import { fromEventDateTime, type EventDto } from '@repo/schemas/events';
import type { events } from '@repo/schemas/database';

type EventRow = typeof events.$inferSelect;

export function toEventDto(event: EventRow): EventDto {
  return {
    id: event.id,
    organizerId: event.organizerId,
    title: event.title,
    category: event.category,
    location: event.location,
    address: event.address,
    ...fromEventDateTime(event.dateTime),
    maxCapacity: event.maxCapacity,
    image: event.image,
    description: extractDescription(event.description),
    contactName: event.contactName,
    contactEmail: event.contactEmail,
  };
}

export function extractDescription(description: Record<string, string>): string {
  return description.en ?? Object.values(description).find((value) => value.length > 0) ?? '';
}

export function stripListingMeta<T extends { createdAt?: unknown; registrationsCount?: unknown }>(
  record: T,
): Omit<T, 'createdAt' | 'registrationsCount'> {
  const { createdAt: _createdAt, registrationsCount: _registrationsCount, ...rest } = record;
  return rest;
}
