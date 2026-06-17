import { createFileRoute, Link } from '@tanstack/react-router';

export const Route = createFileRoute('/terms')({ component: TermsOfService });

function TermsOfService() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-6 py-10 md:py-14">
      <header className="grid gap-3">
        <p className="text-sm font-medium text-muted-foreground">Effective date: June 17, 2026</p>
        <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">Terms of Service</h1>
        <p className="text-muted-foreground">
          These Terms of Service describe the rules for accessing and using ft_transcendence.
        </p>
      </header>

      <div className="prose prose-neutral max-w-none dark:prose-invert">
        <section>
          <h2>Use of the Service</h2>
          <p>
            You may use the application only for lawful purposes and in a way that does not disrupt,
            damage, overload, or compromise the service or other users. You are responsible for the
            information you submit and for keeping any account credentials secure.
          </p>
        </section>

        <section>
          <h2>Acceptable Conduct</h2>
          <p>
            You agree not to misuse the application, attempt unauthorized access, interfere with
            security controls, upload malicious content, impersonate another person, or use the
            service to harass, abuse, or harm others.
          </p>
        </section>

        <section>
          <h2>Availability</h2>
          <p>
            The service is provided on an as-available basis. Features may change, be interrupted,
            or be removed as the project evolves. We are not responsible for losses caused by
            downtime, data loss, or service changes except where required by law.
          </p>
        </section>

        <section>
          <h2>Intellectual Property</h2>
          <p>
            The application code, design, and content are owned by their respective authors or
            licensors. You retain responsibility for content you submit and must have the rights
            needed to provide it.
          </p>
        </section>

        <section>
          <h2>Termination</h2>
          <p>
            Access may be suspended or terminated if these terms are violated, if continued access
            creates security or operational risk, or if the service is discontinued.
          </p>
        </section>

        <section>
          <h2>Contact</h2>
          <p>
            Questions about these terms should be directed to the project maintainers through the
            repository or the communication channel provided with the deployed service.
          </p>
        </section>
      </div>

      <Link to="/" className="text-sm font-medium text-foreground underline underline-offset-4">
        Back to application
      </Link>
    </main>
  );
}
