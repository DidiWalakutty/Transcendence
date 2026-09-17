import { useQuery } from '@tanstack/react-query';
import * as m from '@/@generated/paraglide/messages';
import { useTRPC } from '@/integrations/trpc/react';

export function StatsSection() {
  const trpc = useTRPC();
  const statsQuery = useQuery(trpc.events.getEventStats.queryOptions());
  const stats = statsQuery.data;

  if (!stats) {
    return null;
  }

  return (
    <section
      className="
					bg-surface-subtle
					border-y
					border-border-default
					py-20
					"
    >
      <div
        className="
						mx-auto
						max-w-7xl
						px-6
						"
      >
        <div
          className="
						grid
						grid-cols-1
						gap-12
						text-center
						md:grid-cols-3
						"
        >
          {/* Number of events */}
          <div>
            <p
              className="
											text-5xl
											font-bold
											text-brand-primary-text
											2xl:text-6xl
										"
            >
              {stats.eventCount}
            </p>

            <p
              className="
											mt-3
											text-lg
											text-text-muted
											2xl:text-xl
										"
            >
              {m.stats_event_count()}
            </p>
          </div>

          {/* Number of locations */}
          <div>
            <p
              className="
											text-5xl
											font-bold
											text-brand-primary-text
											2xl:text-6xl
										"
            >
              {stats.locationCount}
            </p>

            <p
              className="
											mt-3
											text-lg
											text-text-muted
											2xl:text-xl
										"
            >
              {m.stats_cities()}
            </p>
          </div>

          {/* Number of categories */}
          <div>
            <p
              className="
											text-5xl
											font-bold
											text-brand-primary-text
											2xl:text-6xl
										"
            >
              {stats.categoryCount}
            </p>

            <p
              className="
											mt-3
											text-lg
											text-text-muted
											2xl:text-xl
										"
            >
              {m.stats_categories()}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
