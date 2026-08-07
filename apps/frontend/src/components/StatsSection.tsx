// Later this data will come from the backend.
// Example future flow:
//
// PostgreSQL database
//        ↓
// NestJS backend
//        ↓
// tRPC endpoint (e.g. getPlatformStats)
//        ↓
// TanStack Query in React
//        ↓
// StatsSection receives the data as props
//
// For now we use static data while building the UI.

// the const stats under this will become something like:
// const { data: stats } = trpc.stats.getPlatformStats.useQuery()
// and the component keeps rendering like:
// {stats.eventCount}
// {stats.locationCount}
// {stats.categoryCount}

import * as m from '@/@generated/paraglide/messages';

const stats = {
  eventCount: 250,
  locationCount: 25,
  categoryCount: 7,
};

export function StatsSection() {
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
											text-brand-primary
											2xl:text-6xl
										"
            >
              {stats.eventCount}+
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
											text-brand-primary
											2xl:text-6xl
										"
            >
              {stats.locationCount}+
            </p>

            <p
              className="
											mt-3
											text-lg
											text-text-muted
											2xl:text-xl
										"
            >
              {m.stats_location()}
            </p>
          </div>

          {/* Number of categories */}
          <div>
            <p
              className="
											text-5xl
											font-bold
											text-brand-primary
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
