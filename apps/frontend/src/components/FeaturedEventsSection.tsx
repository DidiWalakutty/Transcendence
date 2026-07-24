import { EventCard } from '@/components/EventCard';
import { events } from '@/data/events';

export function FeaturedEventsSection() {
  // Only show the first 5 featured events
  // later, this will be connected with backend and become something like:
  // const displayedEvents = await getFeaturedEvents()
  const displayedEvents = events.slice(0, 4);

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
          <h2 className="text-6xl font-bold text-text-primary 2xl:text-7xl">Featured Events</h2>

          <p className="mt-2 text-text-muted text-lg 2xl:text-xl">
            Discover exciting events happening near you.
          </p>
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
