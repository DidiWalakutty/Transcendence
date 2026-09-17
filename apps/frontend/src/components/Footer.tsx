import { Link } from '@tanstack/react-router';
import * as m from '@/@generated/paraglide/messages';

export function Footer() {
  return (
    <footer
      className="
				border-t
				bg-surface-footer
				px-8
				py-16
				text-text-on-brand
				"
    >
      <div
        className="
					mx-auto
					max-w-7xl
					grid
					grid-cols-1
					gap-12
					md:grid-cols-[12fr_4fr_4fr_4fr_4fr]
					"
      >
        {/* Brand */}
        <div className="md:col-span-1">
          <Link
            to="/"
            className="
							text-4xl
							font-bold
							text-brand-primary-text
							"
          >
            {m.button_eventra()}
          </Link>

          <p
            className="
							mt-4
							max-w-xs
							text-text-on-brand/80
							"
          >
            {m.footer_description()}
          </p>
        </div>

        {/* Explore */}
        <div>
          <h3
            className="
							font-semibold
							text-lg
							"
          >
            {m.footer_text_explore()}
          </h3>

          <ul
            className="
							mt-4
							space-y-3
							text-text-on-brand/80
							"
          >
            <li>
              <Link to="/events" className="hover:text-brand-primary-text">
                {m.button_all_events()}
              </Link>
            </li>
          </ul>
        </div>

        {/* Account */}
        <div>
          <h3
            className="
							font-semibold
							text-lg
							"
          >
            {m.footer_text_account()}
          </h3>

          <ul
            className="
							mt-4
							space-y-3
							text-text-on-brand/80
							"
          >
            <li>
              <Link to="/login" className="hover:text-brand-primary-text">
                {m.button_login()}
              </Link>
            </li>

            <li>
              <Link to="/create-account" className="hover:text-brand-primary-text">
                {m.button_create_account()}
              </Link>
            </li>

            <li>
              <Link to="/create-event" className="hover:text-brand-primary-text">
                {m.button_create()}
              </Link>
            </li>
          </ul>
        </div>

        {/* Legal */}
        <div>
          <h3
            className="
							text-lg
							font-semibold
							"
          >
            {m.footer_text_legal()}
          </h3>

          <ul
            className="
							mt-4
							space-y-3
							text-text-on-brand/80
							"
          >
            <li>
              <Link to="/privacy-policy" className="hover:text-brand-primary-text">
                {m.button_privacy()}
              </Link>
            </li>

            <li>
              <Link to="/terms-of-service" className="hover:text-brand-primary-text">
                {m.button_terms()}
              </Link>
            </li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h3
            className="
							text-lg
							font-semibold
							"
          >
            {m.footer_text_contact()}
          </h3>

          <ul
            className="
							mt-4
							space-y-3
							text-text-on-brand/80
							"
          >
            <li>
              <Link to="/contact" className="hover:text-brand-primary-text">
                {m.button_contact()}
              </Link>
            </li>
          </ul>
        </div>

        {/* Bottom Copyright */}
        <div
          className="
						mt-12
						flex
						justify-between
						border-t
						border-white/20
						pt-8
						text-sm
						text-text-on-brand/80
						md:col-span-5
						"
        >
          <p>{m.footer_bottom_text_1()}</p>

          <p>{m.footer_bottom_text_2()}</p>
        </div>
      </div>
    </footer>
  );
}
