import {
  Activity,
  Palette,
  Utensils,
  Dices,
  MicVocal,
  Scissors,
  Infinity as InfinityIcon,
} from 'lucide-react';

import { CategoryCard } from './CategoryCard';
import * as m from '@/@generated/paraglide/messages';

export function CategorySection() {
  return (
    <section
      className="
						bg-brand-primary/15
						py-14
					"
    >
      <div
        className="
						mx-auto
						flex
						min-h-40
						max-w-7xl
						items-center
						px-8
					"
      >
        {/* Category Cards */}
        <div
          className="
							grid
							w-full
							grid-cols-2
							gap-3
							md:grid-cols-3
							lg:grid-cols-4
							2xl:grid-cols-7
							justify-items-center
						"
        >
          <CategoryCard
            category="music"
            icon={<Activity className="size-8 text-brand-primary-text 2xl:size-10" />}
            title={m.category_music()}
          />

          <CategoryCard
            category="culture"
            icon={<Palette className="size-8 text-brand-primary-text 2xl:size-10" />}
            title={m.category_culture()}
          />

          <CategoryCard
            category="food"
            icon={<Utensils className="size-8 text-brand-primary-text 2xl:size-10" />}
            title={m.category_food()}
          />

          <CategoryCard
            category="games"
            icon={<Dices className="size-8 text-brand-primary-text 2xl:size-10" />}
            title={m.category_games()}
          />

          <CategoryCard
            category="talks"
            icon={<MicVocal className="size-8 text-brand-primary-text 2xl:size-10" />}
            title={m.category_talks()}
          />

          <CategoryCard
            category="workshops"
            icon={<Scissors className="size-8 text-brand-primary-text 2xl:size-10" />}
            title={m.category_workshops()}
          />

          <CategoryCard
            category="all"
            icon={<InfinityIcon className="size-8 text-brand-primary-text 2xl:size-10" />}
            title={m.button_all_events()}
          />
        </div>
      </div>
    </section>
  );
}
