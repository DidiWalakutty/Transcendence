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
				>	"
        >
          <CategoryCard
            icon={<Activity className="size-8 text-brand-primary 2xl:size-10" />}
            title="Music"
            href="/events/music"
          />

          <CategoryCard
            icon={<Palette className="size-8 text-brand-primary 2xl:size-10" />}
            title="Culture"
            href="/events/culture"
          />

          <CategoryCard
            icon={<Utensils className="size-8 text-brand-primary 2xl:size-10" />}
            title="Food"
            href="/events/food"
          />

          <CategoryCard
            icon={<Dices className="size-8 text-brand-primary 2xl:size-10" />}
            title="Games"
            href="/events/games"
          />

          <CategoryCard
            icon={<MicVocal className="size-8 text-brand-primary 2xl:size-10" />}
            title="Talks"
            href="/events/talks"
          />

          <CategoryCard
            icon={<Scissors className="size-8 text-brand-primary 2xl:size-10" />}
            title="Workshops"
            href="/events/workshops"
          />

          <CategoryCard
            icon={<InfinityIcon className="size-8 text-brand-primary 2xl:size-10" />}
            title="All Events"
            href="/events"
          />
        </div>
      </div>
    </section>
  );
}
