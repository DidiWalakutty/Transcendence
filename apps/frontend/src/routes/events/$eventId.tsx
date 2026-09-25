import { createFileRoute, notFound } from '@tanstack/react-router';
import { z } from 'zod';
import placeholderEvent from '@/assets/placeholder_event.png';
import { useQuery } from '@tanstack/react-query';
import { useTRPC } from '@/integrations/trpc/react';
import { Button } from '@/components/ui/button';
import { useEventStream } from '@/hooks/use-event-stream';
import { useRegistrationMutations } from '@/hooks/use-registration-mutations';
import { toast } from 'sonner';
import * as m from '@/@generated/paraglide/messages';
import { getCategoryLabel } from '@/lib/categories';
import { eventImageSource } from '@/lib/image';

// A mistyped or stale link is a 404, not an error page: a non-UUID never
// reaches the backend, and an unknown id maps its NOT_FOUND onto the router's
// notFoundComponent. Anything else (backend down…) still surfaces as an error.
function isNotFoundError(error: unknown): boolean {
  const code = (error as { data?: { code?: string } } | null)?.data?.code;
  return code === 'NOT_FOUND' || code === 'BAD_REQUEST';
}

export const Route = createFileRoute('/events/$eventId')({
  loader: async ({ context, params }) => {
    if (!z.uuid().safeParse(params.eventId).success) {
      throw notFound();
    }
    try {
      await context.queryClient.query({
        ...context.trpc.eventCreation.getEventById.queryOptions({ id: params.eventId }),
        staleTime: 'static',
      });
    } catch (error) {
      if (isNotFoundError(error)) throw notFound();
      throw error;
    }
  },
  component: EventDetailPage,
});

function EventDetailPage() {
  const { eventId } = Route.useParams();
  const trpc = useTRPC();
  // An edit by the organizer updates this page while it is open.
  useEventStream();

  const eventQuery = useQuery(
    trpc.eventCreation.getEventById.queryOptions({
      id: eventId,
    }),
  );

  const statusQuery = useQuery(
    trpc.registrations.getRegistrationStatus.queryOptions({ id: eventId }),
  );

  const { register: registerMutation, cancel: cancelMutation } = useRegistrationMutations();

  const event = eventQuery.data;

  const eventImage = eventImageSource(event?.image, placeholderEvent);

  const eventDate = event?.date ? new Date(event.date) : null;

  return (
    <main className="relative min-h-[calc(100vh-180px)] bg-white">
      {/* Background */}
      <div className="absolute inset-0 flex">
        <div className="w-0 bg-primary md:w-[20%] lg:w-[25%] 2xl:w-[30%]" />
        <div className="flex-1 bg-white" />
      </div>

      {/* Page Content */}
      <div className="relative mx-auto max-w-7xl px-6 pb-24 pt-12">
        {/* Event Image */}
        <div className="mx-auto max-w-6xl overflow-hidden rounded-2xl shadow-xl">
          <img
            src={eventImage}
            alt={event?.title ?? ''}
            className="h-[550px] w-full object-cover"
          />
        </div>

        {/* Event Information */}
        <div className="mx-auto mt-[-40px] max-w-4xl">
          <div className="relative rounded-2xl bg-white p-8 shadow-2xl">
            {/* Categories */}
            <div className="absolute right-8 top-8 flex max-w-[40%] flex-wrap justify-end gap-2">
              {event?.category.map((category) => (
                <span
                  key={category}
                  className="rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-brand-primary-text"
                >
                  {getCategoryLabel(category)}
                </span>
              ))}
            </div>

            {/* Title */}
            <h1 className="mt-1 pr-[20%] text-4xl font-bold text-brand-primary-text 2xl:text-5xl">
              {event?.title}
            </h1>

            <div className="mt-4 flex items-end justify-between gap-8">
              {/* Location */}
              <p className="text-lg text-text-muted">{event?.location}</p>

              {/* Date */}
              <div className="mr-6 shrink-0 text-right text-brand-primary-text">
                {eventDate && (
                  <div>
                    <div className="text-lg font-semibold uppercase">
                      {m.event_weekday_long({
                        date: eventDate,
                      })}
                    </div>

                    <div className="text-lg font-semibold uppercase">
                      {m.event_month_long({
                        date: eventDate,
                      })}
                    </div>

                    <div className="text-4xl font-bold leading-none">
                      {m.event_day({
                        date: eventDate,
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div
          className="
            mx-auto
            mt-16
            grid
            max-w-5xl
            gap-8
            lg:grid-cols-[1fr_320px]
          "
        >
          {/* Event Details */}
          <div>
            {/* Description */}
            <section>
              <h2 className="text-2xl font-bold text-text-primary">{m.events_about_title()}</h2>

              <p className="mt-1 text-lg leading-8 text-text-muted">{event?.description}</p>
            </section>

            {/* Address */}
            <section>
              <h2 className="mt-8 text-2xl font-bold text-text-primary">
                {m.create_event_address()}
              </h2>

              <p className="mt-1 text-lg leading-8 text-text-muted">
                {event?.address}, {event?.location}
              </p>
            </section>

            {/* Event Contact Information Panel */}
            {(event?.contactName || event?.contactEmail) && (
              <section className="mt-8 border-t border-gray-100 pt-6">
                <h2 className="text-2xl font-bold text-text-primary">Event Contact</h2>
                <div className="mt-2 flex flex-col gap-1 text-lg text-text-muted">
                  {event.contactName && (
                    <p>
                      <span className="font-semibold text-text-primary">Name:</span>{' '}
                      {event.contactName}
                    </p>
                  )}
                  {event.contactEmail && (
                    <p>
                      <span className="font-semibold text-text-primary">Email:</span>{' '}
                      <a
                        href={`mailto:${event.contactEmail}`}
                        className="font-medium text-primary underline hover:opacity-80"
                      >
                        {event.contactEmail}
                      </a>
                    </p>
                  )}
                </div>
              </section>
            )}
          </div>

          {/* Tickets */}
          <aside
            className="
              w-full
              lg:w-[320px]
              lg:shrink-0
            "
          >
            <div className="sticky top-24 rounded-2xl bg-surface-card p-6 shadow-2xl">
              <h2 className="text-2xl font-bold text-text-primary">{m.events_tickets_title()}</h2>

              <p className="mt-4 text-text-muted">
                <span className="text-3xl font-bold text-primary">
                  {statusQuery.data?.available ?? '...'}
                </span>{' '}
                {m.events_tickets_available()}
              </p>

              <Button
                size="hero"
                type="button"
                onClick={() => {
                  if (statusQuery.data?.reason === 'NOT_LOGGED_IN') {
                    toast.info(m.events_registration_not_logged_in());
                    return;
                  }
                  if (!statusQuery.data?.canRegister) {
                    return;
                  }
                  registerMutation.mutate({ eventId });
                }}
                disabled={registerMutation.isPending || !statusQuery.data?.canRegister}
                className="mt-6 w-full rounded-xl bg-primary px-6 py-4 text-lg font-bold text-white transition hover:opacity-90"
              >
                {statusQuery.data?.reason === 'NOT_LOGGED_IN'
                  ? m.events_registration_not_logged_in()
                  : statusQuery.data?.reason === 'ALREADY_REGISTERED'
                    ? m.events_registration_already_registered()
                    : statusQuery.data?.reason === 'SOLD_OUT'
                      ? m.events_tickets_sold_out()
                      : registerMutation.isPending
                        ? m.events_registration_loading()
                        : m.events_registration_get_ticket()}
              </Button>

              {statusQuery.data?.myRegistration && (
                <Button
                  size="lg"
                  type="button"
                  variant="outline"
                  onClick={() => {
                    cancelMutation.mutate({ eventId });
                  }}
                  disabled={cancelMutation.isPending}
                  className="mt-3 w-full rounded-xl px-6 py-3 text-lg font-bold"
                >
                  {cancelMutation.isPending
                    ? m.events_registration_cancel_loading()
                    : m.events_registration_cancel()}
                </Button>
              )}
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
