import { Link, useRouteContext } from '@tanstack/react-router';
import { Menu } from 'lucide-react';
import { useState } from 'react';

import { LanguageSwitcher } from './LanguageSwitcher';
import { UserMenu } from './UserMenu';
import { navigationItems, type UserRole } from './navigation.config';

import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { usePresenceConnection } from '@/hooks/use-presence';
import * as m from '@/@generated/paraglide/messages';

export function Navbar() {
  const { session } = useRouteContext({ from: '__root__' });
  const hasAdminRole = session?.user.role?.split(',').includes('admin');
  const role: UserRole = !session ? 'visitor' : hasAdminRole ? 'admin' : 'user';
  const links = navigationItems[role];

  // Below `md` the links live in a drawer; it closes itself when a link is
  // followed so the new page is not hidden behind it.
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Keeps the current user marked online for as long as the app is open in
  // this tab, not just while they're on the profile page.
  usePresenceConnection(!!session);

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
						px-4
						md:px-8
						shadow-md
						text-text-primary
					"
    >
      {/* Logo */}
      <div>
        <Link to="/" className="font-bold text-xl 2xl:text-3xl text-brand-primary">
          {m.button_eventra()}
        </Link>
      </div>

      <div className="flex items-center gap-2 md:gap-8">
        {/* Navigation */}
        {/* All needed links are generated through map based on the user's role */}
        <div className="hidden gap-6 text-lg md:flex 2xl:text-2xl">
          {links.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className="transition-colors hover:text-brand-primary"
            >
              {link.label()}
            </Link>
          ))}
        </div>

        {/* Language Switcher */}
        <LanguageSwitcher />

        {/* User Menu */}
        <UserMenu
          role={role}
          name={session?.user.name}
          username={session?.user.username}
          avatar={session?.user.image}
        />

        {/* Drawer with the same links, for narrow screens */}
        <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
          <SheetTrigger
            render={
              <Button
                aria-label={m.button_menu()}
                variant="ghost"
                size="icon"
                className="md:hidden"
              />
            }
          >
            <Menu className="h-5 w-5 text-text-primary" />
          </SheetTrigger>

          <SheetContent side="right" className="w-3/4">
            <SheetHeader>
              <SheetTitle className="text-xl text-brand-primary">{m.button_eventra()}</SheetTitle>
            </SheetHeader>

            <div className="flex flex-col gap-4 px-4 text-lg text-text-primary">
              {links.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  onClick={() => setDrawerOpen(false)}
                  className="transition-colors hover:text-brand-primary"
                >
                  {link.label()}
                </Link>
              ))}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  );
}
