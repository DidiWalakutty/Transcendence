import { EventDate } from '@/components/events/EventDate';

type EventListItemProps = {
  id: string;
  image: string;
  title: string;
  category: string;
  location: string;
  date: string;
  description: string;
};

export function EventListItem({ image, title, category, date, description }: EventListItemProps) {
  return (
    <div className="grid max-w-5xl grid-cols-[70px_1fr] gap-6">
      {/* max-w-5xl making it bigger == bigger card*/}

      {/* Event Date */}
      <EventDate date={date} />

      {/* Event Rectangle */}
      <div
        className="
					relative
					rounded-2xl
					border
					border-border
					bg-white
					p-6
					shadow-md
				"
      >
        {/* Category */}
        <div className="absolute right-6 top-6">
          <span
            className="
							rounded-full
							bg-brand-primary/10
							px-4
							py-2
							text-sm
							font-medium
							text-brand-primary
						"
          >
            {category}
          </span>
        </div>

        {/* Event Content */}
        <div className="flex min-h-40 gap-6">
          {/* Event Image */}
          <div className="h-40 w-40 shrink-0 overflow-hidden rounded-xl">
            <img src={image} alt={title} className="h-full w-full object-cover" />
          </div>

          {/* Event Information */}
          <div className="flex flex-1 flex-col justify-center pr-28">
            <h2 className="text-2xl font-bold text-primary">{title}</h2>

            <p className="mt-2 text-surface-footer/80">{description}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
