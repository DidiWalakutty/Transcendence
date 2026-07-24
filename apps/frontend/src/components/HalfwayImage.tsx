import halfwayImage from '@/assets/halfway_image.png';
import { Button } from '@/components/ui/button';

export function HalfwayImage() {
  return (
    <section
      className="
				relative
				mt-24
				h-[500px]
				overflow-hidden
			"
    >
      {/* Halfway Image */}
      <img
        src={halfwayImage}
        alt="People enjoying an outdoor event"
        className="
					absolute
					inset-0
					h-full
					w-full
					object-cover
					object-center
			"
      />

      {/* Gradient overlay */}
      <div
        className="
					absolute
					inset-0
					bg-gradient-to-r
					from-black/75
					via-black/40
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
					h-full
					max-w-7xl
					items-center
					px-8
			"
      >
        <div className="max-w-xl text-text-on-image">
          <h2
            className="
							text-4xl
							font-bold
							2xl:text-5xl
						"
          >
            Find your next unforgettable experience
          </h2>

          <p
            className="
							mt-6
							text-lg
							leading-relaxed
							text-text-on-image/90
							2xl:text-xl
						"
          >
            Discover a wide range of events, from music festivals to tech conferences, and
            everything in between. Your next adventure awaits!
          </p>

          <Button size="lg" className="mt-10">
            Explore Events
          </Button>
        </div>
      </div>
    </section>
  );
}
