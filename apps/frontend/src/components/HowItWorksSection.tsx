import { Search, Ticket, Laugh } from 'lucide-react';

const steps = [
  {
    title: 'Discover',
    description: 'Find events that match your interests.',
    icon: Search,
  },
  {
    title: 'Register',
    description: 'Sign up for events and secure your spot.',
    icon: Ticket,
  },
  {
    title: 'Enjoy',
    description: 'Join the event and enjoy the experience.',
    icon: Laugh,
  },
];

export function HowItWorksSection() {
  return (
    <section className="py-28">
      <div className="mx-auto max-w-7xl px-6">
        <section className="pt-4 pb-4"></section>

        {/* Section Header */}
        <div className="mb-12 text-center">
          <h2
            className="
							text-6xl 
							font-bold
							text-text-primary
							"
          >
            Discover. Register. Enjoy.
          </h2>

          <p className="mt-3 text-text-muted">Finding your next event has never been easier.</p>
        </div>

        {/* Steps */}
        <div className="grid gap-6 md:grid-cols-3">
          {steps.map((step) => {
            const Icon = step.icon;

            return (
              <div
                key={step.title}
                className="
									rounded-2xl
									border
									bg-surface-card
									p-8
									text-center
									shadow-md
									transition-all
									duration-200
									hover:-translate-y-1
									hover:shadow-lg
									"
              >
                <div
                  className="
									mx-auto
									mb-6
									flex
									h-16
									w-16
									items-center
									justify-center
									rounded-full
									bg-brand-primary/10
									"
                >
                  <Icon className="h-8 w-8 text-brand-primary" />
                </div>

                <h3 className="text-xl font-semibold text-text-primary">{step.title}</h3>

                <p className="mt-3 text-text-muted">{step.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
