import { type EventDto, type EventSortDto } from '@repo/schemas/events';

export type EventListingRecord = EventDto & {
  createdAt: Date;
  registrationsCount: number;
};

export type EventStats = {
  eventCount: number;
  locationCount: number;
  categoryCount: number;
};

export abstract class EventListingsRepository {
  abstract findAll(sort: EventSortDto): Promise<EventListingRecord[]>;
  abstract findFeatured(): Promise<EventListingRecord[]>;
  abstract getStats(): Promise<EventStats>;
  abstract findRegisteredByUser(userId: string): Promise<EventListingRecord[]>;
}
