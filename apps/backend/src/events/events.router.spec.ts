import { describe, expect, it, vi } from 'vitest';

import type { EventDto, UpdateEventDto } from '@repo/schemas/events';
import { EventsRouter } from './events.router';
import { EventsService } from './events.service';

const organizerId = '2de0f53e-a6a2-4aaf-a47d-0ecaafde7748';
const eventId = '64de8cd7-e120-4ad1-b849-4b386f31d599';
const event: EventDto = {
  id: eventId,
  organizerId,
  title: 'Community meetup',
  description: 'Meet people nearby',
  category: ['culture' as const],
  location: 'Amsterdam',
  address: 'Dam 1',
  date: '2026-10-01',
  time: '19:00',
  image: 'https://example.com/event.jpg',
  maxCapacity: 50,
};
const update: UpdateEventDto = {
  id: event.id,
  title: event.title,
  description: event.description,
  category: event.category as UpdateEventDto['category'],
  location: event.location,
  address: event.address,
  date: event.date,
  time: event.time,
  image: event.image,
  maxCapacity: event.maxCapacity,
};

function createRouter() {
  const service = {
    findById: vi.fn().mockResolvedValue(event),
    update: vi.fn().mockResolvedValue(event),
    delete: vi.fn().mockResolvedValue(event),
  } as unknown as EventsService;
  return { router: new EventsRouter(service), service };
}

describe('EventsRouter permissions', () => {
  it('allows an organizer to update their own event', async () => {
    const { router } = createRouter();

    await expect(
      router.updateEvent(update, { user: { id: organizerId, role: 'user' } }),
    ).resolves.toEqual(event);
  });

  it('prevents a regular user from updating another organizer event', async () => {
    const { router } = createRouter();

    await expect(
      router.updateEvent(update, {
        user: { id: 'a5265f78-6e91-4e82-bc39-86e8ec9cd6ca', role: 'user' },
      }),
    ).rejects.toMatchObject({ code: 'FORBIDDEN' });
  });

  it('allows an administrator to delete any event', async () => {
    const { router } = createRouter();

    await expect(
      router.deleteEvent({ id: eventId }, { user: { id: 'admin-id', role: 'admin' } }),
    ).resolves.toEqual(event);
  });
});
