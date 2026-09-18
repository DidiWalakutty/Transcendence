import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxItem,
  ComboboxList,
  useComboboxAnchor,
} from '@/components/ui/combobox';
import * as m from '@/@generated/paraglide/messages';
import { eventCategories, getCategoryLabel } from '@/lib/categories';

const categoryValues = [...eventCategories];

export function EventCategoryCombobox({
  id,
  value,
  onValueChange,
}: {
  id: string;
  value: string[];
  onValueChange: (value: string[]) => void;
}) {
  const anchor = useComboboxAnchor();

  return (
    <Combobox
      items={categoryValues}
      itemToStringLabel={getCategoryLabel}
      multiple
      value={value}
      onValueChange={onValueChange}
    >
      <ComboboxChips ref={anchor}>
        {value.map((category) => (
          <ComboboxChip key={category}>{getCategoryLabel(category)}</ComboboxChip>
        ))}
        <ComboboxChipsInput
          id={id}
          aria-label={m.create_event_category()}
          placeholder={value.length === 0 ? m.create_event_category_placeholder() : undefined}
        />
      </ComboboxChips>
      <ComboboxContent anchor={anchor}>
        <ComboboxEmpty>{m.admin_no_results()}</ComboboxEmpty>
        <ComboboxList>
          {(category: string) => (
            <ComboboxItem key={category} value={category}>
              {getCategoryLabel(category)}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}
