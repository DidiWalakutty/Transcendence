type CategoryCardProps = {
  icon: React.ReactNode;
  title: string;
  href: string;
};

export function CategoryCard({ icon, title, href }: CategoryCardProps) {
  return (
    <a
      href={href}
      className="
				group
				flex
				aspect-square
				w-full
				max-w-36
				2xl:max-w-44
				flex-col
				items-center
				justify-center

				gap-3

				rounded-2xl
				bg-surface-card

				p-4

				shadow-sm

				transition-all
				duration-200

				hover:-translate-y-1
				hover:shadow-lg
			"
    >
      {/* Icon */}
      <div
        className="
					flex
					h-16
					w-16

					2xl:h-20
					2xl:w-20

					items-center
					justify-center

					rounded-full
					bg-surface-page
				"
      >
        {icon}
      </div>

      {/* Title */}
      <p
        className="
					text-center
					font-medium
					text-text-primary
					2xl:text-xl
				"
      >
        {title}
      </p>
    </a>
  );
}
