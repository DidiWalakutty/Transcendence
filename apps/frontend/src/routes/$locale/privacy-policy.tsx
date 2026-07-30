import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/$locale/privacy-policy')({
  component: PrivacyPolicy,
});

function PrivacyPolicy() {
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
        <h1 className="text-5xl font-bold">Privacy Policy</h1>

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
            Eventra is an event management platform that allows users to discover, create, and
            manage events. This Privacy Policy explains how we collect, use, and protect information
            when you use our platform.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">2. Information We Collect</h2>

          <p>
            When creating an account, we may collect information such as your name, email address,
            display name, profile information, and account preferences. Some profile information,
            such as a display name, may be visible to other users when interacting with events on
            the platform.
          </p>

          <p className="mt-3">
            When using the platform, we may also collect technical information such as browser
            information, device data, and usage information needed to operate and secure the
            service.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">3. How We Use Information</h2>

          <p>
            We use collected information to provide Eventra's features, manage user accounts,
            display events, improve the platform, maintain security, and communicate important
            service updates.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">
            4. Event Registration and Attendance Information
          </h2>

          <p>
            When users register for an event, Eventra may store registration information such as the
            user's display name and registration status. This information is used to allow event
            organizers to manage attendance and verify registered participants.
          </p>

          <p className="mt-3">
            Event organizers may be able to view the list of registered participants for their
            events. This allows organizers to check attendance and manage access to events when
            required.
          </p>

          <p className="mt-3">
            Only information necessary for managing the event experience is displayed to organizers
            and other authorized users.
          </p>

          <p className="mt-3">
            For events created by users, Eventra may display the creator's display name or profile
            name alongside the event information so that participants can identify the event
            organizer.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">5. Sharing Information</h2>

          <p>
            We do not sell personal information. Information may be shared only when necessary to
            operate the service, maintain infrastructure, comply with legal obligations, or protect
            the security of the platform.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">6. Data Retention</h2>

          <p>
            We keep information only for as long as necessary to provide the service, maintain
            security, comply with legal requirements, or resolve disputes.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">7. Your Rights</h2>

          <p>
            Depending on applicable laws, users may request access to their personal information,
            corrections, or deletion of their account data.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">8. Changes to This Policy</h2>

          <p>
            We may update this Privacy Policy when the platform changes. Updated versions will be
            made available through the application.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">9. Contact</h2>

          <p>
            For questions regarding this Privacy Policy, please contact the Eventra project team
            through the official project communication channels.
          </p>
        </section>
      </div>
    </section>
  );
}
