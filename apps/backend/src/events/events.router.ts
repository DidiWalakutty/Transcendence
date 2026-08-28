import { Router, Mutation, Input, Ctx } from 'nestjs-trpc';
import { createEventSchema, type CreateEventDto } from '@repo/schemas/events';
import { EventsService } from './events.service';
import { TRPCError } from '@trpc/server';

// Defines the tRPC API endpoint for event creation.
// It validates the incoming event data, checks the logged-in user
// and passes the event to the EventsService for creation in the database.
// A router groups related API endpoints together.
// A mutation is an API operation that changes data, such as creating,
// updating, or deleting an event. Here, the mutation receives the form data,
// checks that the user is logged in, and sends the event to EventsService.

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
}
