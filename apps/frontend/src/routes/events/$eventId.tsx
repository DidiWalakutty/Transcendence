import { createFileRoute } from '@tanstack/react-router';
import placeholderEvent from '@/assets/placeholder_event.png';
import { useQuery } from '@tanstack/react-query';
import { useTRPC } from '@/integrations/trpc/react';
import { Button } from '@/components/ui/button';
import { useEventStream } from '@/hooks/use-event-stream';
import { useRegistrationMutations } from '@/hooks/use-registration-mutations';
import { toast } from 'sonner';
import * as m from '@/@generated/paraglide/messages';

export const Route = createFileRoute('/events/$eventId')({
  loader: async ({ context, params }) => {
    await context.queryClient.query({
      ...context.trpc.eventCreation.getEventById.queryOptions({ id: params.eventId }),
      staleTime: 'static',
    });
  },
  component: EventDetailPage,
});

const categoryTranslations: Record<string, () => string> = {
  music: m.category_music,
  culture: m.category_culture,
  food: m.category_food,
  games: m.category_games,
  talks: m.category_talks,
  workshops: m.category_workshops,
};

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

  const meQuery = useQuery(trpc.users.getMe.queryOptions());

  const ticketQuery = useQuery(
    trpc.registrations.getAvailableTickets.queryOptions({
      id: eventId,
    }),
  );

  const registrationQuery = useQuery(
    trpc.registrations.getMyRegistration.queryOptions({
      id: eventId,
    }),
  );

  const { register: registerMutation, cancel: cancelMutation } = useRegistrationMutations();

  const event = eventQuery.data;

  const eventImage = event?.image && event.image !== 'PLACEHOLDER' ? event.image : placeholderEvent;

  const eventDate = event?.date ? new Date(event.date) : null;

  return (
    <main className="relative min-h-[calc(100vh-180px)] bg-white pb-[500px]">
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
                  className="rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary"
                >
                  {categoryTranslations[category]?.() ?? category}
                </span>
              ))}
            </div>

            {/* Title */}
            <h1 className="mt-1 pr-[20%] text-4xl font-bold text-primary 2xl:text-5xl">
              {event?.title}
            </h1>

            <div className="mt-4 flex items-end justify-between gap-8">
              {/* Location */}
              <p className="text-lg text-text-muted">{event?.location}</p>

              {/* Date */}
              <div className="mr-6 shrink-0 text-right text-primary">
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
            gap-12
            md:max-w-4xl
            lg:ml-[30%]
            lg:max-w-[65%]
            lg:grid-cols-[1fr_320px]
            2xl:ml-[15%]
            2xl:max-w-6xl
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
          </div>

          {/* Tickets */}
          <aside
            className="
              w-[320px]
              shrink-0

              2xl:absolute
              2xl:right-[-300px]
              2xl:top-[800px]
              2xl:w-[320px]
            "
          >
            <div className="sticky top-24 rounded-2xl bg-surface-card p-6 shadow-2xl">
              <h2 className="text-2xl font-bold text-text-primary">{m.events_tickets_title()}</h2>

              <p className="mt-4 text-text-muted">
                <span className="text-3xl font-bold text-primary">{ticketQuery.data ?? '...'}</span>{' '}
                {m.events_tickets_available()}
              </p>

              <Button
                size="hero"
                type="button"
                onClick={() => {
                  // User must be logged in to register
                  if (!meQuery.data) {
                    toast.info(m.events_registration_not_logged_in());
                    return;
                  }

                  // User is already registered
                  if (registrationQuery.data) {
                    return;
                  }

                  // If sold out
                  if (ticketQuery.data === 0) {
                    return;
                  }

                  registerMutation.mutate({ eventId });
                }}
                disabled={
                  registerMutation.isPending || !!registrationQuery.data || ticketQuery.data === 0
                }
                className="mt-6 w-full rounded-xl bg-primary px-6 py-4 text-lg font-bold text-white transition hover:opacity-90"
              >
                {!meQuery.data
                  ? m.events_registration_not_logged_in()
                  : registrationQuery.data
                    ? m.events_registration_already_registered()
                    : ticketQuery.data === 0
                      ? m.events_tickets_sold_out()
                      : registerMutation.isPending
                        ? m.events_registration_loading()
                        : m.events_registration_get_ticket()}
              </Button>

              {registrationQuery.data && (
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
