import * as m from '@/@generated/paraglide/messages';
import { Select, SelectContent, SelectItem, SelectTrigger } from '../ui/select';

type EventSortValue = 'upcoming' | 'popular' | 'newest';

type EventSortProps = {
  selectedSort: EventSortValue;
  onSortChange: (sort: EventSortValue) => void;
};

export function EventSort({ selectedSort, onSortChange }: EventSortProps) {
  const sortLabels = {
    upcoming: m.event_sorting_upcoming(),
    popular: m.event_sorting_popular(),
    newest: m.event_sorting_newest(),
  };

  return (
    <Select
      value={selectedSort}
      onValueChange={(value) => {
        if (value) {
          onSortChange(value as EventSortValue);
        }
      }}
    >
      <SelectTrigger aria-label={m.event_sorting_title()}>
        <span className="flex-1 text-left">{sortLabels[selectedSort]}</span>
      </SelectTrigger>

      <SelectContent>
        <SelectItem value="upcoming">{m.event_sorting_upcoming()}</SelectItem>

        <SelectItem value="popular">{m.event_sorting_popular()}</SelectItem>

        <SelectItem value="newest">{m.event_sorting_newest()}</SelectItem>
      </SelectContent>
    </Select>
  );
}
