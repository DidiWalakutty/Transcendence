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
          <a
            href="/"
            className="
							text-4xl
							font-bold
							text-brand-primary
							"
          >
            Eventra
          </a>

          <p
            className="
							mt-4
							max-w-xs
							text-text-on-brand/80
							"
          >
            Discover, create and enjoy events with ease.
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
            Explore
          </h3>

          <ul
            className="
							mt-4
							space-y-3
							text-text-on-brand/80
							"
          >
            <li>
              <a href="/events" className="hover:text-brand-primary">
                All Events
              </a>
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
            Account
          </h3>

          <ul
            className="
							mt-4
							space-y-3
							text-text-on-brand/80
							"
          >
            <li>
              <a href="/login" className="hover:text-brand-primary">
                Login
              </a>
            </li>

            <li>
              <a href="/create-account" className="hover:text-brand-primary">
                Create Account
              </a>
            </li>

            <li>
              <a href="/create-event" className="hover:text-brand-primary">
                Create Event
              </a>
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
            Legal
          </h3>

          <ul
            className="
							mt-4
							space-y-3
							text-text-on-brand/80
							"
          >
            <li>
              <a href="/privacy-policy" className="hover:text-brand-primary">
                Privacy Policy
              </a>
            </li>

            <li>
              <a href="/terms-of-service" className="hover:text-brand-primary">
                Terms of Service
              </a>
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
            Contact
          </h3>

          <ul
            className="
							mt-4
							space-y-3
							text-text-on-brand/80
						"
          >
            <li>
              <a href="/contact" className="hover:text-brand-primary">
                Contact Us
              </a>
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
          <p>Made with 🧡 for explorers.</p>

          <p>© 2026 Eventra. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
