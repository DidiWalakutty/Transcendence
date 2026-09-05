// Handles the main event operations.
// Connects the event requests to the database and manages event notifications.

import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import type { EventDto, UpdateEventDto } from '@repo/schemas/events';
import { EventsRepository, type CreateEventRecord } from './repositories/events.repository';

const MAX_BUFFERED_EVENTS = 100;

@Injectable()
export class EventsService {
  constructor(
    // repository handles communication with the database.
    private readonly eventEmitter: EventEmitter2,
    private readonly repository: EventsRepository,
  ) {}

  // Create a new event + store using the repository.
  async create(data: CreateEventRecord): Promise<string> {
    return this.repository.create(data);
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
    return this.repository.update(data);
  }

  async delete(id: string): Promise<EventDto | null> {
    return this.repository.delete(id);
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
