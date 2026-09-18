import { Query, Router, Input, Ctx, UseMiddlewares } from 'nestjs-trpc';
import {
  eventsSchema,
  eventSortSchema,
  getEventsQuerySchema,
  paginatedEventsSchema,
  type EventSortDto,
  type GetEventsQueryDto,
} from '@repo/schemas/events';
import { EventListingsService } from './event-listings.service';
import { eventStatsSchema } from '@repo/schemas/stats';
import { ProtectedMiddleware } from '../auth/protected.middleware';
import type { ProtectedCtx } from '../auth/auth.types';
import { z } from 'zod';

@Router({ alias: 'events' })
export class EventListingsRouter {
  constructor(private readonly eventListingsService: EventListingsService) {}

  @Query({ input: eventSortSchema, output: eventsSchema })
  async getEvents(@Input() sort: EventSortDto) {
    return this.eventListingsService.findAll(sort);
  }

  @Query({ input: getEventsQuerySchema, output: paginatedEventsSchema })
  async getFilteredEvents(@Input() input: GetEventsQueryDto) {
    return this.eventListingsService.findFiltered(input);
  }

  @Query({ output: eventsSchema })
  async getFeaturedEvents() {
    return this.eventListingsService.findFeatured();
  }

  @Query({ output: eventStatsSchema })
  async getEventStats() {
    return this.eventListingsService.getStats();
  }

  @UseMiddlewares(ProtectedMiddleware)
  @Query({ output: eventsSchema })
  async getMyRegisteredEvents(@Ctx() ctx: ProtectedCtx) {
    return this.eventListingsService.findRegisteredByUser(ctx.user.id);
  }

  @UseMiddlewares(ProtectedMiddleware)
  @Query({
    input: z.object({ search: z.string().trim().max(200).optional() }),
    output: eventsSchema,
  })
  async searchMyRegisteredEvents(@Input() input: { search?: string }, @Ctx() ctx: ProtectedCtx) {
    return this.eventListingsService.searchUsersEvents(ctx.user.id, input.search);
  }
}
