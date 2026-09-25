import { useCallback, useEffect, useState } from 'react';
import { useQueryClient, type QueryClient, type QueryKey } from '@tanstack/react-query';
import { useSubscription } from '@trpc/tanstack-react-query';
import {
  EVENT_STALE_AFTER_MS,
  EVENT_WATCHDOG_INTERVAL_MS,
  type EventChangedDto,
  type EventDto,
} from '@repo/schemas/events';
import { useTRPC } from '@/integrations/trpc/react';
import { removeById, replaceById } from '@/lib/collection-by-id';

// Module scope on purpose. A ref would be reset every time the component
// remounts, and an unreachable backend can remount the tree repeatedly, which
// would keep pushing the deadline forward and hide the outage forever.
let lastMessageAt = Date.now();

// Updates and deletes are patched straight into the unfiltered listings: they
// cannot change an event's position under any of the server's sort orders, so
// the list stays correct without a refetch.
//
// Everything else refetches instead — still push-driven, not polling:
// - creates, because the server decides where a new event belongs (upcoming by
//   date, newest by creation time, popular by registration count) and the DTO
//   carries none of those fields;
// - the filtered listing, because an edit can move an event into or out of the
//   active filter, and only the server applies it;
// - the organizer's list, because its rows carry an attendee count the DTO
//   does not have, which a patch would overwrite.
function patchList(events: EventDto[] | undefined, event: EventDto, remove: boolean): EventDto[] {
  const current = events ?? [];
  if (remove) return removeById(current, event.id) ?? [];
  return replaceById(current, event) ?? current;
}

// The query keys this stream keeps current. They must name the queries the
// pages actually run: a key for a query nobody uses updates nothing, silently.
export type EventStreamKeys = {
  listings: QueryKey;
  filtered: QueryKey;
  myEvents: QueryKey;
  detail: (id: string) => QueryKey;
};

export function eventStreamKeys(trpc: ReturnType<typeof useTRPC>): EventStreamKeys {
  return {
    listings: trpc.events.getEvents.queryKey(),
    filtered: trpc.events.getFilteredEvents.queryKey({}),
    myEvents: trpc.eventCreation.getMyEventsWithCounts.queryKey(),
    detail: (id) => trpc.eventCreation.getEventById.queryKey({ id }),
  };
}

export function applyEventChange(
  queryClient: QueryClient,
  keys: EventStreamKeys,
  change: EventChangedDto,
  onlyOrganizerId?: string,
) {
  if (change.action === 'heartbeat') {
    return;
  }

  const mine = !onlyOrganizerId || change.event.organizerId === onlyOrganizerId;
  const removed = change.action === 'deleted';

  if (change.action === 'created') {
    void queryClient.invalidateQueries({ queryKey: keys.listings });
  } else {
    // One cache entry per sort order, all patched together.
    queryClient.setQueriesData<EventDto[]>({ queryKey: keys.listings }, (events) =>
      patchList(events, change.event, removed),
    );
  }

  void queryClient.invalidateQueries({ queryKey: keys.filtered });

  if (mine) {
    void queryClient.invalidateQueries({ queryKey: keys.myEvents });
  }

  // A detail page open on this event.
  const detailKey = keys.detail(change.event.id);

  if (removed) {
    queryClient.removeQueries({ queryKey: detailKey });
  } else {
    queryClient.setQueryData(detailKey, change.event);
  }
}

/**
 * Subscribes to event create/update/delete and keeps the event caches current.
 * Mount it once per page that shows events; `onlyOrganizerId` limits organizer
 * list updates to that user's own events.
 *
 * A dropped SSE stream looks identical to an idle one, so the server sends
 * heartbeats and this hook watches for their absence: when they stop, it
 * resubscribes and refetches, since changes made while disconnected were
 * missed.
 */
export function useEventStream(options?: { onlyOrganizerId?: string }) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const [stale, setStale] = useState(false);

  const keys = eventStreamKeys(trpc);
  const { listings: listingsKey, filtered: filteredKey, myEvents: myEventsKey } = keys;

  const refetchLists = useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: listingsKey });
    void queryClient.invalidateQueries({ queryKey: filteredKey });
    void queryClient.invalidateQueries({ queryKey: myEventsKey });
  }, [queryClient, listingsKey, filteredKey, myEventsKey]);

  const subscription = useSubscription(
    trpc.eventCreation.onEventChanged.subscriptionOptions(undefined, {
      onData: (change: EventChangedDto) => {
        lastMessageAt = Date.now();
        setStale(false);
        applyEventChange(queryClient, keys, change, options?.onlyOrganizerId);
      },
    }),
  );

  const { status, reset } = subscription;

  useEffect(() => {
    const watchdog = setInterval(() => {
      if (Date.now() - lastMessageAt <= EVENT_STALE_AFTER_MS) {
        return;
      }

      setStale(true);
      lastMessageAt = Date.now();
      // Tear the dead stream down and start a new one, then resync: anything
      // that changed while the connection was gone never reached this client.
      reset();
      refetchLists();
    }, EVENT_WATCHDOG_INTERVAL_MS);

    return () => clearInterval(watchdog);
  }, [reset, refetchLists]);

  useEffect(() => {
    if (status === 'pending') {
      lastMessageAt = Date.now();
    }
  }, [status]);

  return {
    connected: status === 'pending' && !stale,
    reconnecting: stale || status === 'connecting',
    failed: status === 'error',
  };
}
