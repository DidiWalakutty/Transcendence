// Handles + validates requests related to events, such as creating a new event.
// Checks the request data and makes sure the user is allowed to perform the action.
// Passes the request to the EventsService for processing and returns the result to the client.

import { Router, Mutation, Input, Ctx, Query } from 'nestjs-trpc';
import { createEventSchema, eventIdSchema, type CreateEventDto } from '@repo/schemas/events';
import { EventsService } from './events.service';
import { TRPCError } from '@trpc/server';

@Router({ alias: 'eventCreation' })
export class EventsRouter {
  constructor(private readonly eventsService: EventsService) {}

  @Mutation({ input: createEventSchema })
  async createEvent(
    @Input() input: CreateEventDto,
    // gives current logged-in user context, including the user ID:
    @Ctx() ctx: { user: { id: string } | null },
  ) {
    console.log('CREATE EVENT: router reached');
    if (!ctx.user) {
      throw new TRPCError({ code: 'UNAUTHORIZED' });
    }

    const eventId = await this.eventsService.create({
      ...input,
      organizerId: ctx.user.id,
    });

    return { eventId };
  }

  @Query({ input: eventIdSchema })
  async getEventById(@Input() input: { id: string }) {
    const event = await this.eventsService.findById(input.id);

    if (!event) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Event not found',
      });
    }
    return event;
  }
}
