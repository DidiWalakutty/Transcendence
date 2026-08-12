import * as m from '@/@generated/paraglide/messages';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

type EventSortValue = 'upcoming' | 'popular' | 'newest';

type EventSortProps = {
  selectedSort: EventSortValue;
  onSortChange: (sort: EventSortValue) => void;
};

export function EventSort({ selectedSort, onSortChange }: EventSortProps) {
  return (
    <Select value={selectedSort} onValueChange={(event) => onSortChange(event as EventSortValue)}>
      <SelectTrigger>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="upcoming">{m.event_sorting_upcoming()}</SelectItem>
        <SelectItem value="popular">{m.event_sorting_popular()}</SelectItem>
        <SelectItem value="newest">{m.event_sorting_newest()}</SelectItem>
      </SelectContent>
    </Select>
  );
}
