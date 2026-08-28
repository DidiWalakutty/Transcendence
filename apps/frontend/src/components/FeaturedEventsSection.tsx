import { useQuery } from '@tanstack/react-query';
import { EventCard } from '@/components/EventCard';
import * as m from '@/@generated/paraglide/messages';
import { useTRPC } from '@/integrations/trpc/react';

export function FeaturedEventsSection() {
  const trpc = useTRPC();
  const featuredEventsQuery = useQuery(trpc.events.getFeaturedEvents.queryOptions());
  const displayedEvents = featuredEventsQuery.data ?? [];

  return (
    <section
      className="
					bg-surface-white
					pt-24
					pb-32
					2xl:pt-32
					2xl:pb-48
					"
    >
      <div
        className="
						mx-auto
						max-w-6xl
						2xl:max-w-[1600px]
						px-6
						"
      >
        {/* Section Header */}
        <div className="mb-12 text-center">
          <h2 className="text-6xl font-bold text-text-primary 2xl:text-7xl">
            {m.featured_events_title()}
          </h2>

          <p className="mt-2 text-text-muted text-lg 2xl:text-xl">{m.featured_events_subtitle()}</p>
        </div>

        {/* Event Cards */}
        <div
          className="
						grid
						grid-cols-1
						gap-6
						md:grid-cols-2
						lg:grid-cols-3
						2xl:grid-cols-4
						"
        >
          {displayedEvents.map((event) => (
            <EventCard
              key={event.id}
              id={event.id}
              image={event.image}
              title={event.title}
              category={event.category}
              location={event.location}
              date={event.date}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
