import { Link } from '@tanstack/react-router';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { User } from 'lucide-react';
import { getLocale } from '@/@generated/paraglide/runtime';
import type { UserRole } from './navigation.config';

interface UserMenuProps {
  role: UserRole;
}

export function UserMenu({ role }: UserMenuProps) {
  const locale = getLocale();

  // Visitor is not logged in
  if (role === 'visitor') {
    return (
      <Button variant="ghost" size="icon">
        <Link to="/$locale/login" params={{ locale }}>
          <User className="h-5 w-5 text-text-primary 2xl:h-7 2xl:w-7" />
        </Link>
      </Button>
    );
  }

  // Logged-in users/admins will become dropdown menus
  // Logout must be handled later.
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Button variant="ghost" size="icon">
          <User className="h-5 w-5 text-text-primary 2xl:h-7 2xl:w-7" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end">
        <DropdownMenuItem>
          <Link to="/$locale/profile" params={{ locale }}>
            Profile
          </Link>
        </DropdownMenuItem>

        {role === 'user' && (
          <DropdownMenuItem>
            <Link to="/$locale/my-events" params={{ locale }}>
              My Events
            </Link>
          </DropdownMenuItem>
        )}

        {role === 'admin' && (
          <DropdownMenuItem>
            <Link to="/$locale/admin" params={{ locale }}>
              Admin Dashboard
            </Link>
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
