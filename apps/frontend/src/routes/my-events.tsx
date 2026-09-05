import { createFileRoute, Link, redirect } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import * as m from '@/@generated/paraglide/messages';
import { EventListItem } from '@/components/events/EventListItem';
import { Button } from '@/components/ui/button';
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from '@/components/ui/empty';
import { Spinner } from '@/components/ui/spinner';
import { useTRPC } from '@/integrations/trpc/react';

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
  const myEventsQuery = useQuery(trpc.eventCreation.getMyEvents.queryOptions());
  const events = myEventsQuery.data ?? [];

  return (
    <div className="relative min-h-[calc(100vh-180px)] bg-white">
      {/* Background */}
      <div className="absolute inset-0 flex">
        <div className="w-[30%] bg-primary" />
        <div className="flex-1 bg-white" />
      </div>

      {/* Content */}
      <div className="relative px-4 py-12 md:px-6">
        {/* Header */}
        <div className="grid max-w-[1400px] grid-cols-[30%_1fr] gap-6">
          <div className="relative left-4 2xl:left-[220px]">
            <h1 className="text-4xl font-bold text-surface-footer md:text-5xl">
              {m.my_events_page_title()}
            </h1>

            <p className="mt-3 text-surface-footer/80">{m.my_events_page_subtitle()}</p>
          </div>

          <div className="flex items-start justify-end">
            <Button render={<Link to="/create-event" />}>{m.create_event_create_button()}</Button>
          </div>
        </div>

        {/* Events */}
        <div className="mx-auto mt-12 max-w-[1600px]">
          {myEventsQuery.isPending ? (
            <div className="flex justify-center py-16">
              <Spinner />
            </div>
          ) : events.length === 0 ? (
            <Empty className="min-h-[320px] border-border bg-white/80 shadow-sm">
              <EmptyHeader>
                <EmptyTitle>{m.my_events_page_empty_title()}</EmptyTitle>
                <EmptyDescription>{m.my_events_page_empty_description()}</EmptyDescription>
              </EmptyHeader>

              <Button render={<Link to="/create-event" />}>{m.create_event_create_button()}</Button>
            </Empty>
          ) : (
            <div className="space-y-8">
              {events.map((event) => (
                <EventListItem key={event.id} {...event} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
