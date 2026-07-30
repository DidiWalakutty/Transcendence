import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/$locale/contact')({
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
        <h1 className="text-5xl font-bold">Contact Us</h1>

        <p className="mt-4 text-text-muted">
          Have questions, feedback, or need support? Get in touch with the Eventra team.
        </p>
      </header>

      <div
        className="
				space-y-10
				text-lg
				leading-relaxed
			"
      >
        <section>
          <h2 className="text-2xl font-semibold mb-3">Project Support</h2>

          <p>
            For questions, feedback, or issues related to Eventra, please contact the project team
            using the email address below.
          </p>

          <p className="mt-3">Email: eventra.team@example.com</p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">Privacy Requests</h2>

          <p>
            If you have questions about your personal information, account data, or privacy-related
            requests, please contact the Eventra team.
          </p>
        </section>
      </div>
    </section>
  );
}
