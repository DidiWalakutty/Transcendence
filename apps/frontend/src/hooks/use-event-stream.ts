import { useCallback, useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useSubscription } from '@trpc/tanstack-react-query';
import {
  EVENT_HEARTBEAT_INTERVAL_MS,
  type EventChangedDto,
  type EventDto,
} from '@repo/schemas/events';
import { useTRPC } from '@/integrations/trpc/react';

// Two and a half missed heartbeats before the stream is treated as dead: long
// enough to ride out a slow network, short enough that a restarted backend is
// noticed within half a minute.
const STALE_AFTER_MS = EVENT_HEARTBEAT_INTERVAL_MS * 2.5;
const WATCHDOG_INTERVAL_MS = 5_000;

// Module scope on purpose. A ref would be reset every time the component
// remounts, and an unreachable backend can remount the tree repeatedly, which
// would keep pushing the deadline forward and hide the outage forever.
let lastMessageAt = Date.now();

// Updates and deletes are patched straight into the cached lists: neither can
// change an event's position under any of the server's sort orders, so the
// list stays correct without a refetch.
//
// Creates are different. The server decides where a new event belongs
// (upcoming by date, newest by creation time, popular by registration count)
// and the DTO carries none of those fields, so the client cannot place the row
// itself. Those refetch instead — still push-driven, not polling.
function patchList(events: EventDto[] | undefined, event: EventDto, remove: boolean): EventDto[] {
  const current = events ?? [];

  return remove
    ? current.filter((item) => item.id !== event.id)
    : current.map((item) => (item.id === event.id ? event : item));
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

  const listingsKey = trpc.events.getEvents.queryKey();
  const myEventsKey = trpc.eventCreation.getMyEvents.queryKey();

  const refetchLists = useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: listingsKey });
    void queryClient.invalidateQueries({ queryKey: myEventsKey });
  }, [queryClient, listingsKey, myEventsKey]);

  const subscription = useSubscription(
    trpc.eventCreation.onEventChanged.subscriptionOptions(undefined, {
      onData: (change: EventChangedDto) => {
        lastMessageAt = Date.now();
        setStale(false);

        if (change.action === 'heartbeat') {
          return;
        }

        const mine =
          !options?.onlyOrganizerId || change.event.organizerId === options.onlyOrganizerId;
        const removed = change.action === 'deleted';

        if (change.action === 'created') {
          void queryClient.invalidateQueries({ queryKey: listingsKey });

          if (mine) {
            void queryClient.invalidateQueries({ queryKey: myEventsKey });
          }
        } else {
          // One cache entry per sort order, all patched together.
          queryClient.setQueriesData<EventDto[]>({ queryKey: listingsKey }, (events) =>
            patchList(events, change.event, removed),
          );

          if (mine) {
            queryClient.setQueryData<EventDto[]>(myEventsKey, (events) =>
              patchList(events, change.event, removed),
            );
          }
        }

        // A detail page open on this event.
        const detailKey = trpc.eventCreation.getEventById.queryKey({ id: change.event.id });

        if (removed) {
          queryClient.removeQueries({ queryKey: detailKey });
        } else {
          queryClient.setQueryData(detailKey, change.event);
        }
      },
    }),
  );

  const { status, reset } = subscription;

  useEffect(() => {
    const watchdog = setInterval(() => {
      if (Date.now() - lastMessageAt <= STALE_AFTER_MS) {
        return;
      }

      setStale(true);
      lastMessageAt = Date.now();
      // Tear the dead stream down and start a new one, then resync: anything
      // that changed while the connection was gone never reached this client.
      reset();
      refetchLists();
    }, WATCHDOG_INTERVAL_MS);

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
