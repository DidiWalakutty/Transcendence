import * as m from '@/@generated/paraglide/messages';

// TODO:
// Sorting UI currently only controls the selected option.
//
// Later:
// - Connect this value to EventsPage.
// - Send selected sorting option to the backend/API.
//
// Sorting values:
// - upcoming:
//     Shows events with the nearest future date first.
//
// - popular:
//     Shows events with the highest popularity metric.
//     Requires backend data (e.g. attendees/tickets).
//
// - newest:
//     Shows recently created events first.
//     Requires createdAt field from backend.
//
// Example API usage:
// /events?sort=upcoming
// /events?sort=popular
// /events?sort=newest

type EventSortProps = {
  selectedSort: string;
  onSortChange: (sort: string) => void;
};

export function EventSort({ selectedSort, onSortChange }: EventSortProps) {
  return (
    <select
      value={selectedSort}
      onChange={(event) => onSortChange(event.target.value)}
      className="
        rounded-lg
        border
        border-border
        bg-white
        px-4
        py-2
        text-sm
        text-surface-footer
        shadow-sm
      "
    >
      <option value="upcoming">{m.event_sorting_upcoming()}</option>

      <option value="popular">{m.event_sorting_popular()}</option>

      <option value="newest">{m.event_sorting_newest()}</option>
    </select>
  );
}
