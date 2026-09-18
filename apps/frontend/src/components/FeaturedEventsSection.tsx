import { useQuery } from '@tanstack/react-query';
import { EventCard } from '@/components/events/EventCard';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
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
						max-w-7xl
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

        {/* Event Carousel */}
        <Carousel
          opts={{
            align: 'start',
            loop: true,
          }}
          className="w-full"
        >
          <CarouselContent className="-ml-6 py-4">
            {displayedEvents.map((event) => (
              <CarouselItem key={event.id} className="basis-full pl-6 sm:basis-1/2 lg:basis-1/3">
                <EventCard
                  id={event.id}
                  image={event.image}
                  title={event.title}
                  category={event.category}
                  location={event.location}
                  date={event.date}
                />
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="-left-6" />
          <CarouselNext className="-right-6" />
        </Carousel>
      </div>
    </section>
  );
}
