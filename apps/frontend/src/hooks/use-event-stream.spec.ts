import { afterEach, describe, expect, it } from 'vitest';
import { QueryClient, type QueryKey } from '@tanstack/react-query';
import { createTRPCClient, httpLink } from '@trpc/client';
import { createTRPCOptionsProxy } from '@trpc/tanstack-react-query';
import superjson from 'superjson';
import type { AppRouter } from '@repo/schemas/trpc';
import type { EventDto } from '@repo/schemas/events';
import { applyEventChange, eventStreamKeys } from './use-event-stream';

const event: EventDto = {
  id: '64de8cd7-e120-4ad1-b849-4b386f31d599',
  organizerId: 'organizer',
  title: 'Board games',
  description: 'Play together',
  category: ['games'],
  location: 'Amsterdam',
  address: 'Dam 1',
  date: '2026-10-01',
  time: '19:00',
  image: 'PLACEHOLDER',
  maxCapacity: 20,
};
const edited: EventDto = { ...event, title: 'Board games night' };

const clients: QueryClient[] = [];
afterEach(() => {
  clients.forEach((client) => client.clear());
  clients.length = 0;
});

// Seeds the cache under the same keys the pages query, with the inputs they
// pass, so a page switching to another query fails here instead of silently
// no longer updating.
function setup() {
  const queryClient = new QueryClient();
  clients.push(queryClient);
  const trpc = createTRPCOptionsProxy<AppRouter>({
    client: createTRPCClient<AppRouter>({
      links: [httpLink({ url: 'http://test/trpc', transformer: superjson })],
    }),
    queryClient,
  });

  const pageKeys = {
    // routes/events/index.tsx
    filtered: trpc.events.getFilteredEvents.queryKey({ sort: 'upcoming', page: 1, pageSize: 12 }),
    // routes/my-events.tsx
    myEvents: trpc.eventCreation.getMyEventsWithCounts.queryKey(),
    // components/admin/AdminDashboard.tsx
    listings: trpc.events.getEvents.queryKey('newest'),
    // routes/events/$eventId.tsx
    detail: trpc.eventCreation.getEventById.queryKey({ id: event.id }),
  } satisfies Record<string, QueryKey>;

  for (const key of Object.values(pageKeys)) {
    queryClient.setQueryData<unknown>(key as QueryKey, [event]);
  }
  queryClient.setQueryData<unknown>(pageKeys.detail as QueryKey, event);

  const invalidated = (key: QueryKey) => queryClient.getQueryState(key)?.isInvalidated ?? false;

  return { queryClient, keys: eventStreamKeys(trpc), pageKeys, invalidated };
}

describe('applyEventChange', () => {
  it('refetches the filtered listing and the organizer list on update', () => {
    const { queryClient, keys, pageKeys, invalidated } = setup();

    applyEventChange(queryClient, keys, { action: 'updated', event: edited });

    expect(invalidated(pageKeys.filtered)).toBe(true);
    expect(invalidated(pageKeys.myEvents)).toBe(true);
  });

  it('patches the unfiltered listing and the detail page on update', () => {
    const { queryClient, keys, pageKeys, invalidated } = setup();

    applyEventChange(queryClient, keys, { action: 'updated', event: edited });

    expect(queryClient.getQueryData(pageKeys.listings as QueryKey)).toEqual([edited]);
    expect(invalidated(pageKeys.listings)).toBe(false);
    expect(queryClient.getQueryData(pageKeys.detail as QueryKey)).toEqual(edited);
  });

  it('refetches the filtered listing on delete and drops the detail page', () => {
    const { queryClient, keys, pageKeys, invalidated } = setup();

    applyEventChange(queryClient, keys, { action: 'deleted', event });

    expect(invalidated(pageKeys.filtered)).toBe(true);
    expect(queryClient.getQueryData(pageKeys.listings as QueryKey)).toEqual([]);
    expect(queryClient.getQueryData(pageKeys.detail as QueryKey)).toBeUndefined();
  });

  it('refetches every listing on create', () => {
    const { queryClient, keys, pageKeys, invalidated } = setup();

    applyEventChange(queryClient, keys, { action: 'created', event });

    expect(invalidated(pageKeys.listings)).toBe(true);
    expect(invalidated(pageKeys.filtered)).toBe(true);
    expect(invalidated(pageKeys.myEvents)).toBe(true);
  });

  it("leaves the organizer list alone for someone else's event", () => {
    const { queryClient, keys, pageKeys, invalidated } = setup();

    applyEventChange(queryClient, keys, { action: 'updated', event: edited }, 'someone-else');

    expect(invalidated(pageKeys.myEvents)).toBe(false);
  });

  it('ignores heartbeats', () => {
    const { queryClient, keys, pageKeys, invalidated } = setup();

    applyEventChange(queryClient, keys, { action: 'heartbeat' });

    expect(Object.values(pageKeys).some((key) => invalidated(key))).toBe(false);
  });
});
