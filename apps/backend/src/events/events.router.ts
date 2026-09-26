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
  eventWithAttendeeCountSchema,
  eventsSchema,
  updateEventSchema,
  type CreateEventDto,
  type DeleteEventDto,
  type EventChangedDto,
  type UpdateEventDto,
} from '@repo/schemas/events';
import { EventsService } from './events.service';
import { ProtectedMiddleware } from '../auth/protected.middleware';
import type { ProtectedCtx } from '../auth/auth.types';
import { hasAdminRole } from '../auth/roles';
import { orNotFound, forbiddenError } from '../trpc/trpc.errors';
import { forwardSubscription } from '../trpc/subscription.helpers';

async function assertCanManage(
  eventsService: EventsService,
  eventId: string,
  user: ProtectedCtx['user'],
): Promise<void> {
  const event = await eventsService.findById(eventId);

  if (!event) {
    throw orNotFound(null, 'Event not found');
  }

  if (!hasAdminRole(user) && event.organizerId !== user.id) {
    throw forbiddenError('You can only manage your own events');
  }
}

@Router({ alias: 'eventCreation' })
export class EventsRouter {
  constructor(private readonly eventsService: EventsService) {}

  @UseMiddlewares(ProtectedMiddleware)
  @Mutation({ input: createEventSchema, output: createEventResultSchema })
  async createEvent(@Input() input: CreateEventDto, @Ctx() ctx: ProtectedCtx) {
    const eventId = await this.eventsService.create({
      ...input,
      organizerId: ctx.user.id,
    });

    return { eventId };
  }

  @Query({ input: eventIdSchema, output: eventSchema })
  async getEventById(@Input() input: { id: string }) {
    const event = await this.eventsService.findById(input.id);
    return orNotFound(event, 'Event not found');
  }

  // Public: browsing events needs no session, so neither does watching them
  // change. The stream carries only data getEvents already exposes.
  @Subscription({ output: eventChangedSubscriptionSchema })
  async *onEventChanged(
    @Options() opts: { signal?: AbortSignal },
  ): AsyncGenerator<EventChangedDto, void, void> {
    yield* forwardSubscription(this.eventsService.listenEventChangedWithHeartbeat(opts.signal));
  }

  @UseMiddlewares(ProtectedMiddleware)
  @Query({ output: eventsSchema })
  async getMyEvents(@Ctx() ctx: ProtectedCtx) {
    return this.eventsService.findByOrganizer(ctx.user.id);
  }

  @UseMiddlewares(ProtectedMiddleware)
  @Query({ output: eventWithAttendeeCountSchema.array() })
  async getMyEventsWithCounts(@Ctx() ctx: ProtectedCtx) {
    return this.eventsService.findByOrganizerWithCounts(ctx.user.id);
  }

  @UseMiddlewares(ProtectedMiddleware)
  @Query({ output: eventWithAttendeeCountSchema.array() })
  async getAllEventsWithCounts(@Ctx() ctx: ProtectedCtx) {
    if (!hasAdminRole(ctx.user)) {
      throw forbiddenError('Admin access required');
    }

    return this.eventsService.findAllWithCounts();
  }

  @UseMiddlewares(ProtectedMiddleware)
  @Mutation({ input: updateEventSchema, output: eventSchema })
  async updateEvent(@Input() input: UpdateEventDto, @Ctx() ctx: ProtectedCtx) {
    await assertCanManage(this.eventsService, input.id, ctx.user);
    const event = await this.eventsService.update(input);
    return orNotFound(event, 'Event not found');
  }

  @UseMiddlewares(ProtectedMiddleware)
  @Mutation({ input: deleteEventSchema, output: eventSchema })
  async deleteEvent(@Input() input: DeleteEventDto, @Ctx() ctx: ProtectedCtx) {
    await assertCanManage(this.eventsService, input.id, ctx.user);
    const event = await this.eventsService.delete(input.id);
    return orNotFound(event, 'Event not found');
  }
}
