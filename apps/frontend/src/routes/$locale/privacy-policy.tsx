import { createFileRoute } from '@tanstack/react-router';
import * as m from '@/@generated/paraglide/messages';

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
        <h1 className="text-5xl font-bold">{m.privacy_policy_title()}</h1>

        <p className="mt-4 text-text-muted">{m.privacy_policy_date()}</p>
      </header>

      <div
        className="
				space-y-10
				text-lg
				leading-relaxed
			"
      >
        <section>
          <h2 className="text-2xl font-semibold mb-3">{m.privacy_policy_1()}</h2>

          <p>{m.privacy_policy_1_text()}</p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">{m.privacy_policy_2()}</h2>

          <p>{m.privacy_policy_2_text()}</p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">{m.privacy_policy_3()}</h2>

          <p>{m.privacy_policy_3_text()}</p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">{m.privacy_policy_4()}</h2>

          <p>{m.privacy_policy_4_text()}</p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">{m.privacy_policy_5()}</h2>

          <p>{m.privacy_policy_5_text()}</p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">{m.privacy_policy_6()}</h2>

          <p>{m.privacy_policy_6_text()}</p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">{m.privacy_policy_7()}</h2>

          <p>{m.privacy_policy_7_text()}</p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">{m.privacy_policy_8()}</h2>

          <p>{m.privacy_policy_8_text()}</p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">{m.privacy_policy_9()}</h2>

          <p>{m.privacy_policy_9_text()}</p>
        </section>
      </div>
    </section>
  );
}
