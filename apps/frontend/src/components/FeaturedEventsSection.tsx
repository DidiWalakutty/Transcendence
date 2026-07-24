import { EventCard } from '@/components/EventCard';
import placeholderEvent from '@/assets/placeholder_event.png';

{
  /* Featured Events Section Component */
}
{
  /* later, image will become: even.image, making it dynamic */
}
const featuredEvents = [
  {
    title: 'Summer Festival',
    category: 'Music',
    location: 'Amsterdam, Netherlands',
    date: '2026-08-08',
    image: placeholderEvent,
  },
  {
    title: 'Taste of Amsterdam',
    category: 'Food',
    location: 'Amsterdam, Netherlands',
    date: '2026-07-29',
    image: placeholderEvent,
  },
  {
    title: 'Software Engineering Course',
    category: 'Workshop',
    location: 'The Hague, Netherlands',
    date: '2026-09-15',
    image: placeholderEvent,
  },
  {
    title: 'Moluccan Cultural Festival',
    category: 'Culture',
    location: 'Rotterdam, Netherlands',
    date: '2026-10-05',
    image: placeholderEvent,
  },
  {
    title: 'Board Game Night',
    category: 'Games',
    location: 'Utrecht, Netherlands',
    date: '2026-11-12',
    image: placeholderEvent,
  },
  {
    title: 'Tech Talk: The Future of AI',
    category: 'Talks',
    location: 'Eindhoven, Netherlands',
    date: '2026-12-01',
    image: placeholderEvent,
  },
];

export function FeaturedEventsSection() {
  // Only show the first 5 featured events
  // later, this will be connected with backend and become something like:
  // const displayedEvents = await getFeaturedEvents()
  const displayedEvents = featuredEvents.slice(0, 4);

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
              key={event.title}
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
