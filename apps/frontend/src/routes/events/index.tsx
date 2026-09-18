import { createFileRoute } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { EventListItem } from '@/components/events/EventListItem';
import * as m from '@/@generated/paraglide/messages';
import { EventFilters } from '@/components/events/EventFilters';
import { EventSort } from '@/components/events/EventSort';
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from '@/components/ui/empty';
import { z } from 'zod';
import { useTRPC } from '@/integrations/trpc/react';
import { useEventStream } from '@/hooks/use-event-stream';
import { Button } from '@/components/ui/button';

export const Route = createFileRoute('/events/')({
  validateSearch: z.object({
    page: z.coerce.number().int().positive().optional(),
    category: z.string().optional(),
    sort: z.enum(['upcoming', 'popular', 'newest']).optional(),
  }),
  loaderDeps: ({ search }) => ({ sort: search.sort ?? 'upcoming' }),
  loader: async ({ context, deps }) => {
    // A loader throw fails the whole route, so a backend that is down turns
    // this page into an error screen. Render the shell instead and let the
    // query retry on the client, which is also what the realtime watchdog
    // does after a reconnect.
    await context.queryClient
      .query({
        ...context.trpc.events.getEvents.queryOptions(deps.sort),
        staleTime: 'static',
      })
      .catch(() => undefined);
  },
  component: EventsPage,
});

function EventsPage() {
  const eventsPerPage = 8;
  const navigate = Route.useNavigate();
  const { page, category, sort } = Route.useSearch();
  const currentPage = page ?? 1;
  const selectedCategories = category ? category.split(',') : [];
  const selectedSort = sort ?? 'upcoming';
  const trpc = useTRPC();
  // Keeps this listing current while it is open: another user creating,
  // editing or deleting an event patches the cache here without a refetch.
  const { connected, failed } = useEventStream();
  const eventsQuery = useQuery(trpc.events.getEvents.queryOptions(selectedSort));
  const events = eventsQuery.data ?? [];

  const updateSearch = (updates: {
    page?: number;
    category?: string;
    sort?: 'upcoming' | 'popular' | 'newest';
  }) => {
    void navigate({
      search: (previous) => ({
        ...previous,
        ...updates,
      }),
      replace: true,
    });
  };

  const filteredEvents = events.filter((event) => {
    if (selectedCategories.length === 0) {
      return true;
    }

    return selectedCategories.some((category) => event.category.includes(category));
  });

  const totalPages = Math.max(1, Math.ceil(filteredEvents.length / eventsPerPage));

  const startIndex = (currentPage - 1) * eventsPerPage;

  const displayedEvents = filteredEvents.slice(startIndex, startIndex + eventsPerPage);

  const handleCategoryChange = (category: string) => {
    const newCategories = selectedCategories.includes(category)
      ? selectedCategories.filter((item) => item !== category)
      : [...selectedCategories, category];

    updateSearch({
      page: 1,
      category: newCategories.length > 0 ? newCategories.join(',') : undefined,
    });
  };

  return (
    <div className="relative min-h-[calc(100vh-180px)] bg-white">
      {/* Background */}
      <div className="absolute inset-0 flex">
        <div className="w-[30%] bg-primary" />
        <div className="flex-1 bg-white" />
      </div>

      {/* Content */}
      <div className="relative mx-auto w-full max-w-7xl px-4 py-12 md:px-6">
        {/* Header */}
        <div className="max-w-xl">
          <h1 className="text-4xl font-bold text-surface-footer md:text-5xl">
            {m.events_page_title()}
          </h1>

          <p className="mt-3 text-brand-primary-foreground">{m.events_page_subtitle()}</p>

          <p className="mt-4 flex items-center gap-2 text-sm text-brand-primary-foreground">
            <span
              aria-hidden="true"
              className={`inline-block size-2 rounded-full ${
                connected ? 'bg-green-500' : failed ? 'bg-destructive' : 'bg-surface-footer/40'
              }`}
            />
            {connected ? m.events_live_connected() : m.events_live_reconnecting()}
          </p>
        </div>

        {/* Events + Filters */}
        <div className="mt-12 flex gap-8">
          {/* Event List */}
          <div className="flex-1">
            {filteredEvents.length === 0 ? (
              <Empty className="min-h-[320px] border-border bg-white/80 shadow-sm">
                <EmptyHeader>
                  <EmptyTitle>{m.events_page_empty_title()}</EmptyTitle>
                  <EmptyDescription>{m.events_page_empty_description()}</EmptyDescription>
                </EmptyHeader>

                <Button onClick={() => updateSearch({ page: 1, category: undefined })}>
                  {m.filter_clear()}
                </Button>
              </Empty>
            ) : (
              <div className="space-y-8">
                {displayedEvents.map((event) => (
                  <EventListItem key={event.id} {...event} />
                ))}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="relative w-1/4">
            {/* Sorting */}
            <div className="absolute -top-16 left-0">
              <EventSort
                selectedSort={selectedSort}
                onSortChange={(sort: 'upcoming' | 'popular' | 'newest') =>
                  updateSearch({ page: 1, sort })
                }
              />
            </div>

            {/* Filters */}

            <EventFilters
              selectedCategories={selectedCategories}
              onCategoryChange={handleCategoryChange}
              onClearFilters={() => updateSearch({ page: 1, category: undefined })}
            />
          </div>
        </div>

        {/* Pagination */}

        <div className="mt-12 flex justify-center gap-3">
          <Button
            onClick={() => updateSearch({ page: Math.max(currentPage - 1, 1) })}
            disabled={currentPage === 1}
            className="
			  rounded-lg
			  border
			  px-4
			  py-2
			  disabled:opacity-50
			"
          >
            {m.events_page_pagination_prev()}
          </Button>

          {Array.from({ length: totalPages }).map((_, index) => {
            const page = index + 1;

            return (
              <Button
                key={page}
                onClick={() => updateSearch({ page })}
                className={`
				  rounded-lg
				  px-4
				  py-2
				  ${currentPage === page ? 'bg-primary text-brand-primary-foreground' : 'border'}
				`}
              >
                {page}
              </Button>
            );
          })}

          <Button
            onClick={() => updateSearch({ page: Math.min(currentPage + 1, totalPages) })}
            disabled={currentPage === totalPages}
            className="
			  rounded-lg
			  border
			  px-4
			  py-2
			  disabled:opacity-50
			"
          >
            {m.events_page_pagination_next()}
          </Button>
        </div>
      </div>
    </div>
  );
}
