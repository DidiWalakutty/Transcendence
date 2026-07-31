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
            icon={<Activity className="size-8 text-brand-primary 2xl:size-10" />}
            title={m.category_music()}
            href="/events/music"
          />

          <CategoryCard
            icon={<Palette className="size-8 text-brand-primary 2xl:size-10" />}
            title={m.category_culture()}
            href="/events/culture"
          />

          <CategoryCard
            icon={<Utensils className="size-8 text-brand-primary 2xl:size-10" />}
            title={m.category_food()}
            href="/events/food"
          />

          <CategoryCard
            icon={<Dices className="size-8 text-brand-primary 2xl:size-10" />}
            title={m.category_games()}
            href="/events/games"
          />

          <CategoryCard
            icon={<MicVocal className="size-8 text-brand-primary 2xl:size-10" />}
            title={m.category_talks()}
            href="/events/talks"
          />

          <CategoryCard
            icon={<Scissors className="size-8 text-brand-primary 2xl:size-10" />}
            title={m.category_workshops()}
            href="/events/workshops"
          />

          <CategoryCard
            icon={<InfinityIcon className="size-8 text-brand-primary 2xl:size-10" />}
            title={m.category_all_events()}
            href="/events"
          />
        </div>
      </div>
    </section>
  );
}
