import * as m from '@/@generated/paraglide/messages';
import { Button } from '../ui/button';

const categories = [
  {
    id: 'music',
    title: m.category_music(),
  },
  {
    id: 'culture',
    title: m.category_culture(),
  },
  {
    id: 'food',
    title: m.category_food(),
  },
  {
    id: 'games',
    title: m.category_games(),
  },
  {
    id: 'talks',
    title: m.category_talks(),
  },
  {
    id: 'workshops',
    title: m.category_workshops(),
  },
];

type EventFiltersProps = {
  selectedCategories: string[];
  onCategoryChange: (category: string) => void;
  onClearFilters: () => void;
};

export function EventFilters({
  selectedCategories,
  onCategoryChange,
  onClearFilters,
}: EventFiltersProps) {
  return (
    <aside
      className="
        sticky
        top-36
        rounded-2xl
        bg-primary/10
        p-6
      "
    >
      <h2 className="text-xl font-bold text-primary">{m.filter_title()}</h2>

      <div className="mt-6">
        <h3 className="mb-4 font-semibold text-surface-footer">{m.filter_category_text()}</h3>

        <div className="space-y-3">
          {categories.map((category) => (
            <label
              key={category.id}
              className="
                flex
                cursor-pointer
                items-center
                gap-3
                text-surface-footer
              "
            >
              <input
                type="checkbox"
                className="peer hidden"
                checked={selectedCategories.includes(category.id)}
                onChange={() => onCategoryChange(category.id)}
              />

              <span
                className="
                  flex
                  h-5
                  w-5
                  items-center
                  justify-center
                  rounded-sm
                  border
                  border-surface-footer/40
                  bg-transparent
                  text-sm
                  font-bold
                  text-transparent
                  transition
                  peer-checked:bg-black
                  peer-checked:text-white
                "
              >
                ✓
              </span>

              {category.title}
            </label>
          ))}
          <Button
            onClick={onClearFilters}
            disabled={selectedCategories.length === 0}
            className="
				mt-4
				w-full
				rounded-lg
				border
				border-border
				px-4
				py-2
				text-sm
				disabled:cursor-not-allowed
				disabled:opacity-40
			"
          >
            {m.filter_clear()}
          </Button>
        </div>
      </div>
    </aside>
  );
}
