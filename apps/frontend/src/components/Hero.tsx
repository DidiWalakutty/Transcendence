import heroImage from '@/assets/hero_night_2.png';
import { getLocale } from '@/@generated/paraglide/runtime';
import { Link } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import * as m from '@/@generated/paraglide/messages';

export function Hero() {
  const locale = getLocale();

  return (
    <section
      className="
			relative
			flex
			h-[500px]
			2xl:h-[650px]
			flex-col
			items-start
			justify-start
			overflow-hidden
			"
    >
      {/* Hero Image */}
      <img
        src={heroImage}
        alt="People enjoying an event at night"
        className="
					absolute
					inset-0
					h-full
					w-full
					object-cover
					object-center
					"
      />

      {/* Dark overlay */}
      <div
        className="
					absolute
					inset-0
					bg-gradient-to-r
					from-black/60
					via-black/30
					to-transparent
					"
      />

      {/* Content */}
      <div
        className="
						relative
						z-10
						ml-20
						pt-30
						max-w-xl
						text-left
						text-text-on-image
						"
      >
        <h1
          className="
							text-5xl
							font-bold
							2xl:text-6xl
							"
        >
          {m.hero_title_1()}
          <br />
          {m.hero_title_2()}
        </h1>

        <p
          className="
							mt-4
							max-w-md
							text-lg
							text-text-on-image/90
							2xl:text-xl
							"
        >
          {m.hero_subtitle()}
        </p>

        <div
          className="
						mt-12
						flex
						gap-4
						"
        >
          <Button size="hero">
            <Link to="/$locale/events" params={{ locale }}>
              {m.button_explore()}
            </Link>
          </Button>

          <Button
            size="hero"
            variant="secondary"
            className="
							bg-text-on-image/50
							text-text-on-image
							hover:bg-text-on-image
							hover:text-text-primary
							"
          >
            <Link to="/$locale/create-event" params={{ locale }}>
              {m.button_create()}
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
