// Handles the main event operations.
// Connects the event requests to the database and manages event notifications.

import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  EVENT_HEARTBEAT_INTERVAL_MS,
  type EventChangedDto,
  type EventDto,
  type UpdateEventDto,
} from '@repo/schemas/events';
import { EventsRepository, type CreateEventRecord } from './repositories/events.repository';
import { RegistrationsRepository } from '../registrations/repositories/registrations.repository';

const MAX_BUFFERED_EVENTS = 100;

// Realtime channel for the event feature. Kept in this file so the name lives
// in exactly one place; routers subscribe through listenEventChanged() rather
// than passing the string around.
const EVENT_CHANGED_EVENT = 'event.changed';

@Injectable()
export class EventsService {
  constructor(
    // repository handles communication with the database.
    private readonly eventEmitter: EventEmitter2,
    private readonly repository: EventsRepository,
    private readonly registrationsRepository: RegistrationsRepository,
  ) {}

  // Create a new event + store using the repository.
  // The row is read back so subscribers receive the stored event, not the
  // input, which has no id and no normalised date/time.
  async create(data: CreateEventRecord): Promise<string> {
    const id = await this.repository.create(data);
    const event = await this.repository.findById(id);

    if (event) {
      this.emitChanged('created', event);
    }

    return id;
  }

  // Find an event by ID through the repository
  async findById(id: string): Promise<EventDto | null> {
    return this.repository.findById(id);
  }

  // Find every event organized by a specific user through the repository
  async findByOrganizer(organizerId: string): Promise<EventDto[]> {
    return this.repository.findByOrganizer(organizerId);
  }

  async update(data: UpdateEventDto): Promise<EventDto | null> {
    const oldEventDetails = await this.repository.findById(data.id);
    const event = await this.repository.update(data);

    if (event && oldEventDetails) {
      this.emitChanged('updated', event);
      const attendees = await this.registrationsRepository.getEventAttendees(event.id);

      process.emit('event.modified' as any, { event, attendees, oldEvent: oldEventDetails });
    }

    return event;
  }

  async delete(id: string): Promise<EventDto | null> {
    const eventDetails = await this.repository.findById(id);
    if (!eventDetails) return null;
    const attendees = await this.registrationsRepository.getEventAttendees(id);
    const event = await this.repository.delete(id);

    if (event) {
      this.emitChanged('deleted', event);
      process.emit('event.cancelled' as any, { event: eventDetails, attendees });
    }

    return event;
  }

  // Broadcasts through this same service's emitter. Kept private so callers go
  // through create/update/delete and cannot publish a change that never
  // happened.
  private emitChanged(action: EventChangedDto['action'], event: EventDto) {
    this.emit<EventChangedDto>(EVENT_CHANGED_EVENT, { action, event });
  }

  // Every create, update and delete of an event, for subscribers.
  listenEventChanged(signal?: AbortSignal) {
    return this.listen<EventChangedDto>(EVENT_CHANGED_EVENT, signal);
  }

  // The same stream with a heartbeat woven in. Without it a client cannot
  // distinguish "nothing has happened" from "the connection died", because a
  // dropped SSE stream looks exactly like an idle one.
  async *listenEventChangedWithHeartbeat(
    signal?: AbortSignal,
    intervalMs: number = EVENT_HEARTBEAT_INTERVAL_MS,
  ): AsyncGenerator<EventChangedDto, void, void> {
    const changes = this.listenEventChanged(signal)[Symbol.asyncIterator]();
    let pending = changes.next();
    let timer: ReturnType<typeof setTimeout> | undefined;

    try {
      while (!signal?.aborted) {
        const tick = new Promise<'tick'>((resolve) => {
          timer = setTimeout(() => resolve('tick'), intervalMs);
        });

        const winner = await Promise.race([pending, tick]);

        // The timer is this generator's own resource, so it is cleared here
        // rather than left to the listener's cleanup.
        clearTimeout(timer);
        timer = undefined;

        if (winner === 'tick') {
          yield { action: 'heartbeat' };
          continue;
        }

        if (winner.done) {
          return;
        }

        yield winner.value;
        pending = changes.next();
      }
    } finally {
      clearTimeout(timer);
      await changes.return?.();
    }
  }

  // Emit an event so other parts of the system can listen to it.
  emit<TPayload>(event: string, payload: TPayload) {
    this.eventEmitter.emit(event, payload);
  }

  // Listen for emitted events and provide them to the caller.
  async *listen<TPayload>(
    event: string,
    signal?: AbortSignal,
  ): AsyncGenerator<TPayload, void, void> {
    const payloads: TPayload[] = [];
    let resume: (() => void) | undefined;
    let overflowed = false;

    // Prevent memory overflow by limiting the number of buffered events.
    const onEvent = (payload: TPayload) => {
      if (payloads.length >= MAX_BUFFERED_EVENTS) {
        overflowed = true;
        resume?.();
        resume = undefined;
        return;
      }

      payloads.push(payload);
      resume?.();
      resume = undefined;
    };
    // Wake up the listener when the signal is aborted.
    const onAbort = () => {
      resume?.();
      resume = undefined;
    };

    this.eventEmitter.on(event, onEvent);
    signal?.addEventListener('abort', onAbort, { once: true });

    try {
      // Wait until a new event arrives instead of continuously waiting.
      while (!signal?.aborted) {
        if (payloads.length === 0) {
          await new Promise<void>((resolve) => {
            resume = resolve;
          });
        }

        if (overflowed) {
          throw new Error(`Event subscription exceeded ${MAX_BUFFERED_EVENTS} buffered messages`);
        }

        // Send all buffered events to the caller
        while (payloads.length > 0) {
          yield payloads.shift()!;
        }
      }
    } finally {
      // Remove listeners when subscription is complete
      this.eventEmitter.off(event, onEvent);
      signal?.removeEventListener('abort', onAbort);
    }
  }
}
