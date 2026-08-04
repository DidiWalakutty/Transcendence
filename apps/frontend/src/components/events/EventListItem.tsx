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

// id must currently be passed as _id, because it's not hooked up to the backend yet.
// Temp solution.
export function EventListItem({
  id: _id,
  image,
  title,
  category,
  date,
  description,
}: EventListItemProps) {
  return (
    <div className="grid max-w-5xl grid-cols-[70px_1fr] gap-6">
      {/* Event Date */}
      <EventDate date={date} />

      {/*
        TODO:
        When the event detail page exists, wrap ONLY the event rectangle
        with a TanStack Router <Link> so the entire card becomes clickable.

        Example:

        <Link
          to="/$locale/events/$eventId"
          params={{
            locale,
            eventId: id,
          }}
          className="block"
        >
          <Event Rectangle />
        </Link>

        Notes:
        - Keep the EventDate outside the Link.
        - The whole rectangle should be clickable.
        - The locale should stay dynamic.
        - The "Tickets" element is visual only and should NOT be a
          <button>, since interactive elements shouldn't be nested
          inside a Link.
      */}

      {/* Event Rectangle */}
      <div
        className="
          group
          relative
          cursor-pointer
          rounded-2xl
          border
          border-border
          bg-white
          p-6
          shadow-md
          transition-all
          duration-300
          hover:-translate-y-1
          hover:bg-surface-footer
          hover:shadow-xl
		  hover:border-transparent
        "
      >
        {/* Category */}
        <div
          className="
            absolute
            right-6
            top-6
            transition-all
            duration-300
            group-hover:pointer-events-none
            group-hover:opacity-0
          "
        >
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

        {/* Tickets CTA (visual only) */}
        <div
          className="
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
              text-brand-primary
              shadow-xl
            "
          >
            Tickets
          </div>
        </div>

        {/* Event Content */}
        <div className="flex min-h-40 gap-6">
          {/* Event Image */}
          <div className="h-40 w-40 shrink-0 overflow-hidden rounded-xl">
            <img src={image} alt={title} className="h-full w-full object-cover" />
          </div>

          {/* Event Information */}
          <div className="flex flex-1 flex-col justify-center pr-28">
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
        </div>
      </div>
    </div>
  );
}
