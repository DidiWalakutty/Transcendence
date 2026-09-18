import { createFileRoute, Link } from '@tanstack/react-router';
import { useMemo, useState, type FormEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { EventDto } from '@repo/schemas/events';
import { CalendarDays, Plus } from 'lucide-react';

import * as m from '@/@generated/paraglide/messages';
import { useTRPC } from '@/integrations/trpc/react';
import { useEventStream } from '@/hooks/use-event-stream';
import {
  EventAttendeeDialog,
  EventDeleteDialog,
  EventEditDialog,
  EventManagementTable,
  eventFormToUpdateInput,
} from '@/components/events/EventManagement';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from '@/components/ui/empty';
import { SearchInput, EmptyResults } from '@/components/ui/search-input';
import { Spinner } from '@/components/ui/spinner';
import { filterByFields } from '@/lib/search';
import { invalidateEventsLists } from '@/lib/invalidation';
import { requireAuth } from '@/lib/route-guards';

export const Route = createFileRoute('/my-events')({
  beforeLoad: ({ context: { session } }) => {
    requireAuth(session);
  },
  loader: async ({ context }) => {
    // Same reasoning as the events listing: an unreachable backend should not
    // turn the page into an error screen.
    await context.queryClient
      .query({
        ...context.trpc.eventCreation.getMyEvents.queryOptions(),
        staleTime: 'static',
      })
      .catch(() => undefined);
  },
  component: MyEventsPage,
});

function MyEventsPage() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { session } = Route.useRouteContext();
  // Own events only: a change to somebody else's event must not appear here.
  useEventStream({ onlyOrganizerId: session?.user.id });
  const [search, setSearch] = useState('');
  const [editTarget, setEditTarget] = useState<EventDto | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<EventDto | null>(null);
  const [attendeeTarget, setAttendeeTarget] = useState<EventDto | null>(null);

  const myEventsQuery = useQuery(trpc.eventCreation.getMyEventsWithCounts.queryOptions());

  const attendeeDetailQuery = useQuery({
    ...trpc.registrations.getEventAttendees.queryOptions(
      { id: attendeeTarget?.id ?? '' },
      { enabled: !!attendeeTarget },
    ),
  });

  // Both mutations are owner-or-admin on the server; getMyEvents only ever
  // returns events this user organizes, so the table cannot offer someone
  // else's event in the first place.
  const invalidateEvents = async () => {
    await invalidateEventsLists(queryClient, trpc);
  };

  const updateEvent = useMutation(
    trpc.eventCreation.updateEvent.mutationOptions({
      onSuccess: async () => {
        setEditTarget(null);
        await invalidateEvents();
      },
    }),
  );
  const deleteEvent = useMutation(
    trpc.eventCreation.deleteEvent.mutationOptions({
      onSuccess: async () => {
        setDeleteTarget(null);
        await invalidateEvents();
      },
    }),
  );

  const events = useMemo(
    () =>
      filterByFields(myEventsQuery.data ?? [], search, (event) => [
        event.title,
        event.location,
        event.address,
        ...event.category,
      ]),
    [search, myEventsQuery.data],
  );

  const attendeeCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const event of myEventsQuery.data ?? []) {
      counts.set(event.id, event.attendeeCount);
    }
    return counts;
  }, [myEventsQuery.data]);

  function submitEvent(form: FormEvent<HTMLFormElement>) {
    form.preventDefault();
    if (!editTarget) return;
    const data = new FormData(form.currentTarget);
    updateEvent.mutate(eventFormToUpdateInput(editTarget.id, data));
  }

  if (myEventsQuery.isPending) {
    return <Spinner className="mx-auto my-24" />;
  }

  if (myEventsQuery.error) {
    return (
      <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6">
        <Alert variant="destructive">
          <AlertDescription>{myEventsQuery.error.message}</AlertDescription>
        </Alert>
      </div>
    );
  }

  const mutationError = updateEvent.error ?? deleteEvent.error;
  const totalEvents = myEventsQuery.data?.length ?? 0;

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6">
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">{m.my_events_page_title()}</h1>
          <p className="text-muted-foreground">{m.my_events_page_subtitle()}</p>
        </div>

        <Link to="/create-event" className={buttonVariants()}>
          <Plus />
          {m.create_event_create_button()}
        </Link>
      </div>

      <Card size="sm" className="mb-8 sm:max-w-xs">
        <CardHeader>
          <CardDescription>{m.admin_events()}</CardDescription>
          <CardTitle className="flex items-center justify-between text-2xl">
            {totalEvents}
            <CalendarDays className="size-5 text-primary" />
          </CardTitle>
        </CardHeader>
      </Card>

      {mutationError && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{mutationError.message}</AlertDescription>
        </Alert>
      )}

      {totalEvents === 0 ? (
        <Empty className="min-h-[320px] border-border shadow-sm">
          <EmptyHeader>
            <EmptyTitle>{m.my_events_page_empty_title()}</EmptyTitle>
            <EmptyDescription>{m.my_events_page_empty_description()}</EmptyDescription>
          </EmptyHeader>

          <Link to="/create-event" className={buttonVariants()}>
            {m.create_event_create_button()}
          </Link>
        </Empty>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>{m.my_events_manage_title()}</CardTitle>
            <CardDescription>{m.my_events_manage_description()}</CardDescription>
            <SearchInput value={search} onChange={setSearch} placeholder={m.my_events_search()} />
          </CardHeader>
          <CardContent>
            <EventManagementTable
              events={events}
              attendeeCounts={attendeeCounts}
              onAttendees={setAttendeeTarget}
              onEdit={setEditTarget}
              onDelete={setDeleteTarget}
            />
            {events.length === 0 && <EmptyResults message={m.admin_no_results()} />}
          </CardContent>
        </Card>
      )}

      <EventEditDialog
        event={editTarget}
        pending={updateEvent.isPending}
        onClose={() => setEditTarget(null)}
        onSubmit={submitEvent}
      />
      <EventDeleteDialog
        event={deleteTarget}
        pending={deleteEvent.isPending}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && deleteEvent.mutate({ id: deleteTarget.id })}
      />

      <EventAttendeeDialog
        event={attendeeTarget}
        attendees={attendeeDetailQuery.data ?? []}
        onClose={() => setAttendeeTarget(null)}
      />
    </div>
  );
}
