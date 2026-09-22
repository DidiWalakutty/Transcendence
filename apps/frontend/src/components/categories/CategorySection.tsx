import type { ReactNode } from 'react';
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
import { getCategoryLabel } from '@/lib/categories';

const CATEGORY_ICONS: Record<string, ReactNode> = {
  music: <Activity className="size-8 text-brand-primary-text 2xl:size-10" />,
  culture: <Palette className="size-8 text-brand-primary-text 2xl:size-10" />,
  food: <Utensils className="size-8 text-brand-primary-text 2xl:size-10" />,
  games: <Dices className="size-8 text-brand-primary-text 2xl:size-10" />,
  talks: <MicVocal className="size-8 text-brand-primary-text 2xl:size-10" />,
  workshops: <Scissors className="size-8 text-brand-primary-text 2xl:size-10" />,
};

const CATEGORY_IDS = ['music', 'culture', 'food', 'games', 'talks', 'workshops'] as const;

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
          {CATEGORY_IDS.map((id) => (
            <CategoryCard
              key={id}
              category={id}
              icon={CATEGORY_ICONS[id]}
              title={getCategoryLabel(id)}
            />
          ))}

          {/* All Events Card */}
          <CategoryCard
            icon={<InfinityIcon className="size-8 text-brand-primary-text 2xl:size-10" />}
            title={m.button_all_events()}
          />
        </div>
      </div>
    </section>
  );
}
