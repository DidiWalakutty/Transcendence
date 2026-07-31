import { Link } from '@tanstack/react-router';

import { LanguageSwitcher } from './LanguageSwitcher';
import { UserMenu } from './UserMenu';
import { navigationItems, type UserRole } from './navigation.config';

import { getLocale } from '@/@generated/paraglide/runtime';
import * as m from '@/@generated/paraglide/messages';

// temporary hardcoded user role, will be replaced with actual user role from auth context
// will later become something like: const role = session.user.role
const role: UserRole = 'visitor';

export function Navbar() {
  const links = navigationItems[role];
  const locale = getLocale();

  return (
    <nav
      className="
						sticky 
						top-4 
						z-50
						mx-2
						flex 
						h-16 
						2xl:h-20 
						items-center 
						justify-between
						rounded-xl
						border 
						border-border-default
						bg-surface-card
						px-8
						shadow-md
						text-text-primary
					"
    >
      {/* Logo */}
      <div>
        <Link
          to="/$locale"
          params={{ locale }}
          className="font-bold text-xl 2xl:text-3xl text-brand-primary"
        >
          {m.button_eventra()}
        </Link>
      </div>

      <div className="flex items-center gap-8">
        {/* Navigation */}
        {/* All needed links are generated through map based on the user's role */}
        <div className="flex gap-6 text-lg 2xl:text-2xl">
          {links.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              params={{ locale }}
              className="transition-colors hover:text-brand-primary"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Language Switcher */}
        <LanguageSwitcher />

        {/* User Menu */}
        <UserMenu role={role} />
      </div>
    </nav>
  );
}
