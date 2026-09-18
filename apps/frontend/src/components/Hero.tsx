import heroImage from '@/assets/hero_night_2.png';
import { Link } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import * as m from '@/@generated/paraglide/messages';

export function Hero() {
  return (
    <section
      className="
			relative
			flex
			h-[500px]
			2xl:h-[650px]
			overflow-hidden
			"
    >
      {/* Hero Image */}
      <img
        src={heroImage}
        alt={m.hero_image_alt()}
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
						mx-auto
						flex
						w-full
						max-w-7xl
						items-center
						px-8
						"
      >
        <div
          className="
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
            <Button size="hero" className="text-white [text-shadow:0_1px_2px_#190b02]">
              <Link to="/events">{m.button_explore()}</Link>
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
              <Link to="/create-event">{m.button_create()}</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
