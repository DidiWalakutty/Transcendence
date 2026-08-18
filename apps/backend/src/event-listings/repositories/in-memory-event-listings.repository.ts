import { Injectable } from '@nestjs/common';

import { createEventFixtures } from '../fixtures/events.fixture';
import { type EventSortDto } from '@repo/schemas/events';
import { type EventListingRecord, EventListingsRepository } from './event-listings.repository';

@Injectable()
export class InMemoryEventListingsRepository extends EventListingsRepository {
  private readonly events = createEventFixtures();

  async findAll(sort: EventSortDto): Promise<EventListingRecord[]> {
    const events = [...this.events];

    switch (sort) {
      case 'popular':
        return events.sort(
          (a, b) => b.registrationsCount - a.registrationsCount || a.date.localeCompare(b.date),
        );
      case 'newest':
        return events.sort(
          (a, b) => b.createdAt.getTime() - a.createdAt.getTime() || a.date.localeCompare(b.date),
        );
      default:
        return events.sort(
          (a, b) => a.date.localeCompare(b.date) || a.createdAt.getTime() - b.createdAt.getTime(),
        );
    }
  }

  async findFeatured(): Promise<EventListingRecord[]> {
    return [...this.events].sort((a, b) => a.date.localeCompare(b.date)).slice(0, 4);
  }
}
