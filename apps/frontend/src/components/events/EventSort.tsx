import * as m from '@/@generated/paraglide/messages';

type EventSortValue = 'upcoming' | 'popular' | 'newest';

type EventSortProps = {
  selectedSort: EventSortValue;
  onSortChange: (sort: EventSortValue) => void;
};

export function EventSort({ selectedSort, onSortChange }: EventSortProps) {
  return (
    <select
      value={selectedSort}
      onChange={(event) => onSortChange(event.target.value as EventSortValue)}
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
