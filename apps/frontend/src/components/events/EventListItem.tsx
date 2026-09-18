import { Link } from '@tanstack/react-router';
import { EventDate } from '@/components/events/EventDate';
import * as m from '@/@generated/paraglide/messages';
import { Badge } from '../ui/badge';
import placeholderEvent from '@/assets/placeholder_event.png';

type EventListItemProps = {
  id: string;
  image: string;
  title: string;
  category: string[];
  location: string;
  date: string;
  description: string;
};

const categoryLabels: Record<string, () => string> = {
  music: m.category_music,
  culture: m.category_culture,
  food: m.category_food,
  games: m.category_games,
  talks: m.category_talks,
  workshops: m.category_workshops,
};

// id must currently be passed as _id, because it's not hooked up to the backend yet.
// Temp solution.
export function EventListItem({
  id,
  image,
  title,
  category,
  date,
  description,
}: EventListItemProps) {
  return (
    <div className="grid max-w-5xl grid-cols-[70px_1fr] gap-4 md:gap-6">
      {/* Event Date: white text, so it gets its own orange tile where the
          page's orange column is not there (below `lg`) */}
      <div className="flex self-start justify-center rounded-xl bg-primary py-3 lg:self-auto lg:rounded-none lg:bg-transparent lg:py-0">
        <EventDate date={date} />
      </div>

      {/* Event Rectangle */}
      <Link
        to="/events/$eventId"
        params={{
          eventId: id,
        }}
        className="
			group
			relative
			cursor-pointer
			rounded-2xl
			border
			border-border
			bg-white
			p-4
			shadow-md
			md:p-6
			transition-all
			duration-300
			hover:-translate-y-1
			hover:bg-surface-footer
			hover:shadow-xl
			hover:border-transparent
		"
      >
        {/* Event Content */}
        <div className="flex min-h-40 flex-col gap-4 md:flex-row md:gap-6">
          {/* Event Image */}
          <div className="h-40 w-full shrink-0 overflow-hidden rounded-xl md:w-40">
            <img
              src={image === 'PLACEHOLDER' ? placeholderEvent : image}
              alt={title}
              className="h-full w-full object-cover"
            />
          </div>

          {/* Event Information */}
          <div className="flex flex-1 flex-col justify-center md:pr-28">
            <h2
              className="
				text-2xl
				font-bold
				text-primary
				transition-colors
				duration-300
				group-hover:text-white
				"
            >
              {title}
            </h2>

            <p
              className="
				mt-2
				line-clamp-2
				text-surface-footer/80
				transition-colors
				duration-300
				group-hover:text-white/90
				"
            >
              {description}
            </p>
          </div>

          {/* Category */}
          <div className="flex flex-wrap gap-2 md:absolute md:right-6 md:top-6 md:max-w-[200px] md:justify-end">
            {category.length > 0 &&
              category.map((cat) => <Badge key={cat}>{categoryLabels[cat]?.() ?? cat}</Badge>)}
          </div>

          {/* Tickets CTA: shown on hover, which touch screens do not have */}
          <div
            className="
				hidden
				md:block
				absolute
				right-20
				top-1/2
				translate-x-4
				-translate-y-1/2
				opacity-0
				transition-all
				duration-300
				group-hover:translate-x-0
				group-hover:opacity-100
			"
          >
            <div
              className="
				rounded-2xl
				bg-white
				px-15
				py-5
				text-center
				text-xl
				font-bold
				text-brand-primary-text
				shadow-xl
				"
            >
              {m.button_tickets()}
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}
