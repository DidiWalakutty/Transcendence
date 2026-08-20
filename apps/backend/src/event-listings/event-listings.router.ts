import { Query, Router, Input } from 'nestjs-trpc';

import { eventsSchema, eventSortSchema, type EventSortDto } from '@repo/schemas/events';
import { EventListingsService } from './event-listings.service';
import { eventStatsSchema } from '@repo/schemas/stats';

@Router({ alias: 'events' })
export class EventListingsRouter {
  constructor(private readonly eventListingsService: EventListingsService) {}

  @Query({ input: eventSortSchema, output: eventsSchema })
  async getEvents(@Input() sort: EventSortDto) {
    return this.eventListingsService.findAll(sort);
  }

  @Query({ output: eventsSchema })
  async getFeaturedEvents() {
    return this.eventListingsService.findFeatured();
  }

  @Query({ output: eventStatsSchema })
  async getEventStats() {
    return this.eventListingsService.getStats();
  }
}
