import { createFileRoute, Link, redirect } from '@tanstack/react-router';
import { useMemo, useState, type FormEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { EventDto } from '@repo/schemas/events';
import { CalendarDays, Plus, Search } from 'lucide-react';

import * as m from '@/@generated/paraglide/messages';
import { useTRPC } from '@/integrations/trpc/react';
import {
  EventDeleteDialog,
  EventEditDialog,
  EventManagementTable,
  formCategories,
  formString,
} from '@/components/events/EventManagement';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from '@/components/ui/empty';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';

export const Route = createFileRoute('/my-events')({
  beforeLoad: ({ context: { session } }) => {
    if (!session) {
      throw redirect({ to: '/login' });
    }
  },
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(
      context.trpc.eventCreation.getMyEvents.queryOptions(),
    );
  },
  component: MyEventsPage,
});

function MyEventsPage() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [editTarget, setEditTarget] = useState<EventDto | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<EventDto | null>(null);

  const myEventsQuery = useQuery(trpc.eventCreation.getMyEvents.queryOptions());

  // Both mutations are owner-or-admin on the server; getMyEvents only ever
  // returns events this user organizes, so the table cannot offer someone
  // else's event in the first place.
  const invalidateEvents = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: trpc.eventCreation.getMyEvents.queryKey() }),
      queryClient.invalidateQueries({ queryKey: trpc.events.getEvents.queryKey() }),
    ]);
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

  const events = useMemo(() => {
    const query = search.trim().toLowerCase();
    return (myEventsQuery.data ?? []).filter((event) =>
      [event.title, event.location, event.address, ...event.category].some((value) =>
        value.toLowerCase().includes(query),
      ),
    );
  }, [search, myEventsQuery.data]);

  function submitEvent(submitEvent: FormEvent<HTMLFormElement>) {
    submitEvent.preventDefault();
    if (!editTarget) return;
    const data = new FormData(submitEvent.currentTarget);
    updateEvent.mutate({
      id: editTarget.id,
      title: formString(data, 'title'),
      description: formString(data, 'description'),
      category: formCategories(data),
      location: formString(data, 'location'),
      address: formString(data, 'address'),
      date: formString(data, 'date'),
      time: formString(data, 'time'),
      image: formString(data, 'image'),
      maxCapacity: Number(data.get('maxCapacity')),
    });
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
            <div className="relative mt-4 max-w-md">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={m.my_events_search()}
                aria-label={m.my_events_search()}
                className="pl-9"
              />
            </div>
          </CardHeader>
          <CardContent>
            <EventManagementTable
              events={events}
              onEdit={setEditTarget}
              onDelete={setDeleteTarget}
            />
            {events.length === 0 && (
              <p className="py-10 text-center text-muted-foreground">{m.admin_no_results()}</p>
            )}
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
    </div>
  );
}
