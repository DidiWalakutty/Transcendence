import { Calendar, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import * as m from '@/@generated/paraglide/messages';
import placeholderEvent from '@/assets/placeholder_event.png';

{
  /* TODO: Add event id and link to the event details page once it exists. */
}
type EventCardProps = {
  image: string;
  title: string;
  category: string[];
  location: string;
  date: string;
};

export function EventCard({ image, title, category, location, date }: EventCardProps) {
  const eventDate = new Date(date);

  const month = m.event_month({
    date: eventDate,
  });

  const day = m.event_day({
    date: eventDate,
  });

  const formattedDate = m.event_date({
    date: eventDate,
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
          src={image === 'PLACEHOLDER' ? placeholderEvent : image}
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
					right-4
					top-4
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
						inline-block
						rounded-full
						bg-brand-primary/10
						px-3
						py-1
						text-center
						text-sm
						font-medium
						text-brand-primary
					"
        >
          {category.join(' • ')}
        </p>

        {/* Event Title */}
        <h3
          className="
							mt-4
							min-h-[3.5rem]
							line-clamp-2
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

        {/* TODO:
						Once the event details page exists,
						navigate to:
						/$locale/events/$eventId
					*/}
        <Button className="mt-auto w-full">{m.button_view_event()}</Button>
      </div>
    </div>
  );
}
