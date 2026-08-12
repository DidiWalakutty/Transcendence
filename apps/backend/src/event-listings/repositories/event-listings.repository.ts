import { type EventDto, type EventSortDto } from '@repo/schemas/events';

export type EventListingRecord = EventDto & {
  createdAt: Date;
  registrationsCount: number;
};

export abstract class EventListingsRepository {
  abstract findAll(sort: EventSortDto): Promise<EventListingRecord[]>;
}
