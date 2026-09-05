// Handles + validates requests related to events, such as creating a new event.
// Checks the request data and makes sure the user is allowed to perform the action.
// Passes the request to the EventsService for processing and returns the result to the client.

import {
  Router,
  Mutation,
  Input,
  Ctx,
  Options,
  Query,
  Subscription,
  UseMiddlewares,
} from 'nestjs-trpc';
import {
  createEventResultSchema,
  createEventSchema,
  deleteEventSchema,
  eventIdSchema,
  eventChangedSubscriptionSchema,
  eventSchema,
  eventsSchema,
  updateEventSchema,
  type CreateEventDto,
  type DeleteEventDto,
  type EventChangedDto,
  type UpdateEventDto,
} from '@repo/schemas/events';
import { EventsService } from './events.service';
import { ProtectedMiddleware } from '../auth/protected.middleware';
import { forbiddenError, notFoundError } from '../trpc/trpc.errors';

type EventAuthContext = {
  user: { id: string; role?: string | null };
};

async function assertCanManage(
  eventsService: EventsService,
  eventId: string,
  user: EventAuthContext['user'],
): Promise<void> {
  const event = await eventsService.findById(eventId);

  if (!event) {
    throw notFoundError('Event not found');
  }

  const hasAdminRole = user.role?.split(',').includes('admin');
  if (!hasAdminRole && event.organizerId !== user.id) {
    throw forbiddenError('You can only manage your own events');
  }
}

@Router({ alias: 'eventCreation' })
export class EventsRouter {
  constructor(private readonly eventsService: EventsService) {}

  @UseMiddlewares(ProtectedMiddleware)
  @Mutation({ input: createEventSchema, output: createEventResultSchema })
  async createEvent(@Input() input: CreateEventDto, @Ctx() ctx: EventAuthContext) {
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
      throw notFoundError('Event not found');
    }
    return event;
  }

  // Public: browsing events needs no session, so neither does watching them
  // change. The stream carries only data getEvents already exposes.
  @Subscription({ output: eventChangedSubscriptionSchema })
  async *onEventChanged(
    @Options() opts: { signal?: AbortSignal },
  ): AsyncGenerator<EventChangedDto, void, void> {
    for await (const change of this.eventsService.listenEventChangedWithHeartbeat(opts.signal)) {
      yield change;
    }
  }

  @UseMiddlewares(ProtectedMiddleware)
  @Query({ output: eventsSchema })
  async getMyEvents(@Ctx() ctx: EventAuthContext) {
    return this.eventsService.findByOrganizer(ctx.user.id);
  }

  @UseMiddlewares(ProtectedMiddleware)
  @Mutation({ input: updateEventSchema, output: eventSchema })
  async updateEvent(@Input() input: UpdateEventDto, @Ctx() ctx: EventAuthContext) {
    await assertCanManage(this.eventsService, input.id, ctx.user);
    const event = await this.eventsService.update(input);

    if (!event) {
      throw notFoundError('Event not found');
    }

    return event;
  }

  @UseMiddlewares(ProtectedMiddleware)
  @Mutation({ input: deleteEventSchema, output: eventSchema })
  async deleteEvent(@Input() input: DeleteEventDto, @Ctx() ctx: EventAuthContext) {
    await assertCanManage(this.eventsService, input.id, ctx.user);
    const event = await this.eventsService.delete(input.id);

    if (!event) {
      throw notFoundError('Event not found');
    }

    return event;
  }
}
