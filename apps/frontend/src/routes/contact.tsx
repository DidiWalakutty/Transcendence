import { createFileRoute } from '@tanstack/react-router';
import * as m from '@/@generated/paraglide/messages';

export const Route = createFileRoute('/contact')({
  component: Contact,
});

function Contact() {
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
        <h1 className="text-5xl font-bold">{m.contact_title()}</h1>

        <p className="mt-4 text-text-muted">{m.contact_subtitle()}</p>
      </header>

      <div
        className="
				space-y-10
				text-lg
				leading-relaxed
			"
      >
        <section>
          <h2 className="text-2xl font-semibold mb-3">{m.contact_project_support_title()}</h2>

          <p>{m.contact_project_support_description()}</p>

          <p className="mt-3">{m.contact_project_support_email()}</p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">{m.contact_privacy_requests_title()}</h2>

          <p>{m.contact_privacy_requests_description()}</p>
        </section>
      </div>
    </section>
  );
}
