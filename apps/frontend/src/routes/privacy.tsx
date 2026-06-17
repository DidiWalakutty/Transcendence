import { createFileRoute, Link } from '@tanstack/react-router';

export const Route = createFileRoute('/privacy')({ component: PrivacyPolicy });

function PrivacyPolicy() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-6 py-10 md:py-14">
      <header className="grid gap-3">
        <p className="text-sm font-medium text-muted-foreground">Effective date: June 17, 2026</p>
        <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">Privacy Policy</h1>
        <p className="text-muted-foreground">
          This Privacy Policy explains how ft_transcendence handles information when you use this
          application.
        </p>
      </header>

      <div className="prose prose-neutral max-w-none dark:prose-invert">
        <section>
          <h2>Information We Collect</h2>
          <p>
            The application may collect account or profile information that you choose to provide,
            such as a display name and email address. It may also process technical information
            needed to operate the service, including request metadata, session data, security logs,
            and basic device or browser information.
          </p>
        </section>

        <section>
          <h2>How We Use Information</h2>
          <p>
            We use information to provide the application, maintain user accounts, secure the
            service, troubleshoot errors, prevent abuse, and improve reliability. We do not sell
            personal information.
          </p>
        </section>

        <section>
          <h2>Storage and Retention</h2>
          <p>
            Information is retained only for as long as needed for the application, legal
            obligations, security, backups, or legitimate operational purposes. Test or development
            data should not be treated as permanent storage.
          </p>
        </section>

        <section>
          <h2>Sharing</h2>
          <p>
            We may share information with service providers that help host, secure, or operate the
            application, or when required by law. Providers are expected to handle information only
            for the services they provide to us.
          </p>
        </section>

        <section>
          <h2>Your Choices</h2>
          <p>
            You may request access, correction, or deletion of information associated with your
            account where applicable. Some information may be retained when required for security,
            legal compliance, or backup integrity.
          </p>
        </section>

        <section>
          <h2>Contact</h2>
          <p>
            For privacy questions or requests, contact the project maintainers through the
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
