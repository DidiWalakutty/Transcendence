import { Query, Mutation, Router, Input, Ctx } from 'nestjs-trpc';
import { z } from 'zod';
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
  async getMyRegisteredEvents(@Ctx() ctx: any) {
    const userId = ctx.user?.id;
    if (!userId) return [];
    return this.eventListingsService.findRegisteredByUser(userId);
  }

  @Mutation({ input: z.object({ eventId: z.string() }), output: z.boolean() })
  async cancelRegistration(@Input() input: { eventId: string }, @Ctx() ctx: any) {
    const userId = ctx.user?.id;
    if (!userId) return false;
    await this.eventListingsService.cancelUserRegistration(input.eventId, userId);
    return true;
  }
}
