import { createFileRoute } from '@tanstack/react-router';
import { events } from '@/data/events';
import { EventListItem } from '@/components/events/EventListItem';
import { useState } from 'react';
import * as m from '@/@generated/paraglide/messages';
import { EventFilters } from '@/components/events/EventFilters';
import { EventSort } from '@/components/events/EventSort';

export const Route = createFileRoute('/$locale/events')({
  component: EventsPage,
});

function EventsPage() {
  /*
    TODO: Backend integration

    Currently:
    - Filtering, sorting and pagination happen on the frontend.
    - Data comes from the static events array.

    Later:
    - Fetch events from backend/API.
    - Send filters, sorting and pagination as query parameters.
    - Backend/database handles the heavy lifting.

    Example future request:

    GET /events?page=2&category=music&sort=upcoming

    Backend returns:
    - Only requested page.
    - Already filtered events.
    - Already sorted events.
  */

  // ---------------------------------------
  // Pagination
  // ---------------------------------------

  /*
    TODO: Pagination

    Currently:
    - All events are loaded at once.
    - Pagination happens client-side using slice().

    Later:
    - Move pagination to backend.
    - Fetch only events needed for the current page.
    - Store current page in URL.

    Example:

    /events?page=2

    Backend handles:

    LIMIT 8 OFFSET 8
  */

  const eventsPerPage = 8;
  const [currentPage, setCurrentPage] = useState(1);

  // ---------------------------------------
  // Filtering
  // ---------------------------------------

  /*
    TODO: Filtering

    Currently:
    - Categories are filtered locally in React.
    - Uses mock event data.

    Later:
    - Selected filters should become query parameters.
    - Database performs filtering.

    Example:

    /events?category=music

    Future filters:
    - category
    - date range
    - location
  */

  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const filteredEvents = events.filter((event) => {
    if (selectedCategories.length === 0) {
      return true;
    }

    return selectedCategories.includes(event.category);
  });

  // ---------------------------------------
  // Sorting
  // ---------------------------------------

  /*
    TODO: Sorting

    Currently:
    - Sorting state exists locally.
    - Sorting will temporarily happen on the frontend.

    Later:
    - Send selectedSort to backend/API.
    - Backend/database handles ordering.

    Example:

    /events?sort=upcoming
    /events?sort=popular
    /events?sort=newest

    Available sorting values:

    upcoming:
    - Soonest events first.
    - Uses event date.

    popular:
    - Most popular events first.
    - Requires popularity data from backend.

    newest:
    - Recently created events first.
    - Requires createdAt field.
  */

  const [selectedSort, setSelectedSort] = useState('upcoming');

  /*
    Temporary frontend sorting.

    This will be removed once sorting moves to backend.
  */

  const sortedEvents = [...filteredEvents].sort((a, b) => {
    if (selectedSort === 'upcoming') {
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    }

    // if (selectedSort === 'newest') {
    //   return (
    //     new Date(b.createdAt).getTime() -
    //     new Date(a.createdAt).getTime()
    //   );
    // }

    // if (selectedSort === 'popular') {
    //   return b.attendees - a.attendees;
    // }

    return 0;
  });

  // ---------------------------------------
  // Displayed events
  // ---------------------------------------

  const totalPages = Math.ceil(sortedEvents.length / eventsPerPage);

  const startIndex = (currentPage - 1) * eventsPerPage;

  const displayedEvents = sortedEvents.slice(startIndex, startIndex + eventsPerPage);

  return (
    <div className="relative min-h-[calc(100vh-180px)] bg-white">
      {/* Background */}
      <div className="absolute inset-0 flex">
        <div className="w-[30%] bg-primary" />
        <div className="flex-1 bg-white" />
      </div>

      {/* Content */}
      <div className="relative px-4 py-12 md:px-6">
        {/* Header */}
        <div className="grid max-w-[1400px] grid-cols-[30%_1fr] gap-6">
          <div className="relative left-4 2xl:left-[220px]">
            <h1 className="text-4xl font-bold text-surface-footer md:text-5xl">
              {m.events_page_title()}
            </h1>

            <p className="mt-3 text-surface-footer/80">{m.events_page_subtitle()}</p>
          </div>

          <div />
        </div>

        {/* Events + Filters */}
        <div className="mx-auto mt-12 flex max-w-[1600px] gap-8">
          {/* Event List */}
          <div className="flex-1 space-y-8">
            {displayedEvents.map((event) => (
              <EventListItem key={event.id} {...event} />
            ))}
          </div>

          {/* Sidebar */}
          <div className="relative w-1/4">
            {/* Sorting */}
            <div className="absolute -top-16 left-0">
              <EventSort selectedSort={selectedSort} onSortChange={setSelectedSort} />
            </div>

            {/* Filters */}

            <EventFilters
              selectedCategories={selectedCategories}
              onCategoryChange={(category) => {
                setSelectedCategories((prev) =>
                  prev.includes(category)
                    ? prev.filter((item) => item !== category)
                    : [...prev, category],
                );
              }}
              onClearFilters={() => setSelectedCategories([])}
            />
          </div>
        </div>

        {/* Pagination */}

        <div className="mt-12 flex justify-center gap-3">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
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
          </button>

          {Array.from({ length: totalPages }).map((_, index) => {
            const page = index + 1;

            return (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`
                  rounded-lg
                  px-4
                  py-2
                  ${currentPage === page ? 'bg-primary text-white' : 'border'}
                `}
              >
                {page}
              </button>
            );
          })}

          <button
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
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
          </button>
        </div>
      </div>
    </div>
  );
}
