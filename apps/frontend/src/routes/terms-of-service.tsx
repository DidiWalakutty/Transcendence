import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/terms-of-service')({
  component: TermsOfService,
});

function TermsOfService() {
  return (
    <section
      className="
			mx-auto
			max-w-4xl
			px-6
			py-16
			text-text-primary
		"
    >
      <header className="mb-12">
        <h1 className="text-5xl font-bold">Terms of Service</h1>

        <p className="mt-4 text-text-muted">Effective date: July 22, 2026</p>
      </header>

      <div
        className="
				space-y-10
				text-lg
				leading-relaxed
			"
      >
        <section>
          <h2 className="text-2xl font-semibold mb-3">1. Introduction</h2>

          <p>
            Eventra is an event management platform that allows users to discover, create, register
            for, and manage events. By using Eventra, you agree to these Terms of Service.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">2. User Accounts</h2>

          <p>
            Some Eventra features require an account. When creating an account, you agree to provide
            accurate information and keep your account information secure.
          </p>

          <p className="mt-3">
            You are responsible for activity performed through your account. If you believe your
            account has been compromised, you should take appropriate steps to secure it.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">3. Creating and Managing Events</h2>

          <p>
            Registered users may create and manage events on Eventra. Event creators are responsible
            for ensuring that event information, including descriptions, dates, locations, and
            requirements, is accurate.
          </p>

          <p className="mt-3">
            Users must not create events that violate applicable laws, infringe on the rights of
            others, contain harmful content, or intentionally provide misleading information.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">4. Event Registration</h2>

          <p>
            Users may register for available events through Eventra. When registering for an event,
            your account information, such as your display name and registration status, may be used
            to manage your participation.
          </p>

          <p className="mt-3">
            Event organizers may view a list of registered participants for their events. This
            allows organizers to verify attendance, manage participant access, and organize the
            event effectively.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">5. Acceptable Use</h2>

          <p>When using Eventra, you agree not to:</p>

          <ul
            className="
						mt-3
						list-disc
						pl-6
						space-y-2
					"
          >
            <li>Use the platform for unlawful purposes.</li>

            <li>Provide false or misleading information.</li>

            <li>Harass, abuse, or harm other users.</li>

            <li>Attempt to compromise the security or operation of the platform.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">6. User Content</h2>

          <p>
            Users are responsible for content they submit to Eventra, including event descriptions,
            profile information, and other provided details.
          </p>

          <p className="mt-3">
            Eventra does not guarantee the accuracy, availability, or quality of events created by
            users.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">7. Availability of the Service</h2>

          <p>
            We aim to keep Eventra reliable and available, but we cannot guarantee uninterrupted
            access. The platform may be updated, changed, or temporarily unavailable for maintenance
            or improvements.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">8. Account Restrictions</h2>

          <p>
            Eventra may restrict or remove access to accounts that violate these Terms of Service or
            negatively affect the safety, security, or reliability of the platform.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">9. Changes to These Terms</h2>

          <p>
            These Terms of Service may be updated when Eventra changes or when new requirements
            apply. Continued use of the platform after updates means that you accept the revised
            terms.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">10. Contact</h2>

          <p>
            For questions regarding these Terms of Service, please contact the Eventra project team
            through the official project communication channels.
          </p>
        </section>
      </div>
    </section>
  );
}
