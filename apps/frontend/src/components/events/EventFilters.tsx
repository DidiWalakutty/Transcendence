import * as m from '@/@generated/paraglide/messages';
import { Button } from '../ui/button';
import { getCategoryOptions } from '@/lib/categories';

const categories = getCategoryOptions();

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
                checked={selectedCategories.includes(category.id)}
                onChange={() => onCategoryChange(category.id)}
                className="
    peer
    absolute
    h-5
    w-5
    opacity-0
    cursor-pointer
    focus-visible:outline-none
    focus-visible:ring-2
    focus-visible:ring-primary
    focus-visible:ring-offset-2
  "
              />

              <span
                aria-hidden="true"
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
    peer-focus-visible:ring-2
    peer-focus-visible:ring-primary
    peer-focus-visible:ring-offset-2
  "
              >
                ✓
              </span>

              {category.title()}
            </label>
          ))}
          <Button
            aria-label={m.filter_clear()}
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
