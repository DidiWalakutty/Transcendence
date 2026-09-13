import { Query, Router, Input, Ctx } from 'nestjs-trpc';
import { unauthorizedError } from '../trpc/trpc.errors';
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

  @Query({ output: eventsSchema })
  async getMyRegisteredEvents(@Ctx() ctx: { user: { id: string } | null }) {
    const userId = ctx.user?.id;
    if (!userId) throw unauthorizedError('Not logged in');
    return this.eventListingsService.findRegisteredByUser(userId);
  }
}
