import { createFileRoute } from '@tanstack/react-router';
import * as m from '@/@generated/paraglide/messages';

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
        <h1 className="text-5xl font-bold">{m.terms_title()}</h1>

        <p className="mt-4 text-text-muted">{m.terms_date()}</p>
      </header>

      <div
        className="
				space-y-10
				text-lg
				leading-relaxed
			"
      >
        <section>
          <h2 className="text-2xl font-semibold mb-3">{m.terms_1()}</h2>

          <p>{m.terms_1_text()}</p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">{m.terms_2()}</h2>

          <p>{m.terms_2_text()}</p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">{m.terms_3()}</h2>

          <p>{m.terms_3_text()}</p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">{m.terms_4()}</h2>

          <p>{m.terms_4_text()}</p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">{m.terms_5()}</h2>

          <p>{m.terms_5_intro()}</p>

          <ul className="mt-3 list-disc pl-6 space-y-2">
            <li>{m.terms_5_item_1()}</li>
            <li>{m.terms_5_item_2()}</li>
            <li>{m.terms_5_item_3()}</li>
            <li>{m.terms_5_item_4()}</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">{m.terms_6()}</h2>

          <p>{m.terms_6_text()}</p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">{m.terms_7()}</h2>

          <p>{m.terms_7_text()}</p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">{m.terms_8()}</h2>

          <p>{m.terms_8_text()}</p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">{m.terms_9()}</h2>

          <p>{m.terms_9_text()}</p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">{m.terms_10()}</h2>

          <p>{m.terms_10_text()}</p>
        </section>
      </div>
    </section>
  );
}
