import { createFileRoute } from '@tanstack/react-router';
import { events } from '@/data/events';
import { EventListItem } from '@/components/events/EventListItem';
import { useState } from 'react';

export const Route = createFileRoute('/$locale/events')({
  component: EventsPage,
});

function EventsPage() {
  // Pagination logic
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
        <div className="mx-auto max-w-[1400px]">
          {/* Header */}
          <div className="relative w-[30%]">
            <h1 className="text-4xl font-bold text-surface-footer md:text-5xl">All Events</h1>

            <p className="mt-3 text-surface-footer/80">Discover events happening near you.</p>
          </div>

          {/* Event List */}
          <div className="mt-12 space-y-8">
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
              Previous
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
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
