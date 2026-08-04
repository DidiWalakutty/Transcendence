import { createFileRoute } from '@tanstack/react-router';
import { events } from '@/data/events';
import { EventListItem } from '@/components/events/EventListItem';
import { useState } from 'react';
import * as m from '@/@generated/paraglide/messages';

export const Route = createFileRoute('/$locale/events')({
  component: EventsPage,
});

function EventsPage() {
  // Pagination logic
  // Needs to be hooked up to database so every refresh stays
  // on the same page, and so that the number of events per page can be dynamic.
  const eventsPerPage = 8;
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(events.length / eventsPerPage);
  const startIndex = (currentPage - 1) * eventsPerPage;
  const displayedEvents = events.slice(startIndex, startIndex + eventsPerPage);

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

        {/* Event List */}
        <div className="mx-auto mt-12 max-w-[1400px] space-y-8">
          {displayedEvents.map((event) => (
            <EventListItem key={event.id} {...event} />
          ))}
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
