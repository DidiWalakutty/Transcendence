import { Calendar, MapPin } from 'lucide-react';
import { Button } from './ui/button';

type EventCardProps = {
  image: string;
  title: string;
  category: string;
  location: string;
  date: string;
};

export function EventCard({ image, title, category, location, date }: EventCardProps) {
  // Convert the ISO date string into a JavaScript Date object
  const eventDate = new Date(date);

  // Later this will come from Inlang Paraglide
  const locale = 'en-GB';

  // Date badge
  const day = eventDate.toLocaleDateString(locale, {
    day: '2-digit',
  });

  const month = eventDate.toLocaleDateString(locale, {
    month: 'short',
  });

  // Full formatted date
  const formattedDate = eventDate.toLocaleDateString(locale, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div
      className="
				flex
				h-full
				min-h-[500px]
				flex-col
				overflow-hidden
				rounded-2xl
				bg-surface-card
				shadow-md
				transition-all
				duration-200
				hover:-translate-y-1
				hover:shadow-xl
			"
    >
      {/* Event Image */}
      <div className="relative">
        <img
          src={image}
          alt={title}
          className="
						h-52
						w-full
						object-cover
					"
        />

        {/* Gradient Overlay */}
        <div
          className="
						absolute
						inset-0
						bg-gradient-to-t
						from-black/30
						to-transparent
					"
        />

        {/* Date Badge */}
        <div
          className="
						absolute
						top-4
						right-4
						flex
						flex-col
						items-center
						rounded-xl
						bg-surface-card
						px-3
						py-2
						shadow-lg
						backdrop-blur-sm
					"
        >
          <p
            className="
							text-xs
							font-semibold
							uppercase
							tracking-wide
							text-brand-primary
						"
          >
            {month}
          </p>

          <p
            className="
							text-2xl
							font-bold
							leading-none
							text-text-primary
						"
          >
            {day}
          </p>
        </div>
      </div>

      {/* Event Details */}
      <div className="flex flex-1 flex-col p-6">
        {/* Category */}
        <p
          className="
						text-center
						inline-block
						rounded-full
						bg-brand-primary/10
						px-3
						py-1
						text-sm
						font-medium
						text-brand-primary
					"
        >
          {category}
        </p>

        {/* Event Title */}
        <h3
          className="
						mt-4
						line-clamp-2
						min-h-[3.5rem]
						text-xl
						font-bold
						2xl:text-2xl
					"
        >
          {title}
        </h3>

        {/* Location */}
        <div
          className="
						mt-3
						flex
						items-center
						gap-2
						text-text-muted
					"
        >
          <MapPin className="h-4 w-4" />
          <span>{location}</span>
        </div>

        {/* Date */}
        <div
          className="
						mt-1
						flex
						items-center
						gap-2
						text-text-muted
					"
        >
          <Calendar className="h-4 w-4" />
          <span>{formattedDate}</span>
        </div>

        <Button className="mt-auto w-full">View Event</Button>
      </div>
    </div>
  );
}
