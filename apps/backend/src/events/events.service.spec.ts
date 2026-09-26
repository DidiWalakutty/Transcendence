// Tests the EventsService to ensure it correctly delivers events and cleans up listeners when a subscription is aborted..
// Checks that events are received correctly and that subscriptions are cleaned up.

import { EventEmitter2 } from '@nestjs/event-emitter';
import { describe, expect, it } from 'vitest';

import type { EventChangedDto, EventDto } from '@repo/schemas/events';

import { EventsService } from './events.service';
import { EventsRepository } from './repositories/events.repository';
import { RegistrationsRepository } from '../registrations/repositories/registrations.repository';

const storedEvent: EventDto = {
  id: '64de8cd7-e120-4ad1-b849-4b386f31d599',
  organizerId: '2de0f53e-a6a2-4aaf-a47d-0ecaafde7748',
  title: 'Community meetup',
  description: 'Meet people nearby',
  category: ['culture' as const],
  location: 'Amsterdam',
  address: 'Dam 1',
  date: '2026-10-01',
  time: '19:00',
  image: 'PLACEHOLDER',
  maxCapacity: 50,
};

const mockRegistrationsRepository = {
  getAvailableTickets: async () => 0,
  findActiveRegistration: async () => null,
  isEventOrganizer: async () => false,
  getEventAttendees: async () => [], // Returns a clean empty array so no cancellations try to loop over missing rows
  getAttendeeCounts: async (ids: string[]) => ids.map((eventId) => ({ eventId, count: 0 })),
  register: async () => ({ type: 'success' as const, registration: {} as any }),
  create: async () => ({}) as any,
  cancel: async () => null,
} as unknown as RegistrationsRepository;

describe('EventsService', () => {
  it('delivers events and removes listeners when a subscription aborts', async () => {
    const emitter = new EventEmitter2();

    const repository = {
      create: async () => 'test-event-id',
      findById: async () => null,
      findAll: async () => [],
      findByOrganizer: async () => [],
      update: async () => null,
      delete: async () => null,
    } satisfies EventsRepository;

    const service = new EventsService(emitter, repository, mockRegistrationsRepository);

    const abortController = new AbortController();
    const subscription = service.listen<string>('user.created', abortController.signal);
    const nextEvent = subscription.next();

    service.emit('user.created', 'payload');

    await expect(nextEvent).resolves.toEqual({
      done: false,
      value: 'payload',
    });

    const completion = subscription.next();
    abortController.abort();

    await expect(completion).resolves.toEqual({
      done: true,
      value: undefined,
    });
    expect(emitter.listenerCount('user.created')).toBe(0);
  });

  it('sends a heartbeat when no event has been broadcast', async () => {
    const repository = {
      create: async () => storedEvent.id,
      findById: async () => storedEvent,
      findAll: async () => [storedEvent],
      findByOrganizer: async () => [storedEvent],
      update: async () => storedEvent,
      delete: async () => storedEvent,
    } satisfies EventsRepository;

    const service = new EventsService(new EventEmitter2(), repository, mockRegistrationsRepository);
    const abortController = new AbortController();
    const stream = service.listenEventChangedWithHeartbeat(abortController.signal, 10);

    await expect(stream.next()).resolves.toEqual({
      done: false,
      value: { action: 'heartbeat' },
    });

    abortController.abort();
    await stream.return(undefined);
  });

  it('broadcasts every create, update and delete to subscribers', async () => {
    const repository = {
      create: async () => storedEvent.id,
      findById: async () => storedEvent,
      findAll: async () => [storedEvent],
      findByOrganizer: async () => [storedEvent],
      update: async () => storedEvent,
      delete: async () => storedEvent,
    } satisfies EventsRepository;

    const service = new EventsService(new EventEmitter2(), repository, mockRegistrationsRepository);
    const abortController = new AbortController();
    const changes = service.listenEventChanged(abortController.signal);
    const received: EventChangedDto[] = [];

    const collect = (async () => {
      for await (const change of changes) {
        received.push(change);
        if (received.length === 3) break;
      }
    })();

    // The listener registers on first pull, so let it start before emitting.
    await Promise.resolve();
    await service.create({
      ...storedEvent,
      category: storedEvent.category as (
        | 'culture'
        | 'food'
        | 'games'
        | 'music'
        | 'talks'
        | 'workshops'
      )[],
      organizerId: storedEvent.organizerId!,
      contactName: storedEvent.contactName ?? undefined,
      contactEmail: storedEvent.contactEmail ?? undefined,
    });
    await service.update({
      ...storedEvent,
      id: storedEvent.id,
      category: storedEvent.category as (
        | 'culture'
        | 'food'
        | 'games'
        | 'music'
        | 'talks'
        | 'workshops'
      )[],
      contactName: storedEvent.contactName ?? undefined,
      contactEmail: storedEvent.contactEmail ?? undefined,
    });
    await service.delete(storedEvent.id);
    await collect;
    abortController.abort();

    expect(received.map((change) => change.action)).toEqual(['created', 'updated', 'deleted']);

    const [firstChange] = received;
    expect(firstChange.action === 'heartbeat' ? undefined : firstChange.event).toEqual(storedEvent);
  });
});
