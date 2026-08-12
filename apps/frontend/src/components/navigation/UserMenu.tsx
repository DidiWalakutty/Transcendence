import { useNavigate } from '@tanstack/react-router';
import { Link } from '@tanstack/react-router';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { User } from 'lucide-react';
import { authClient } from '@/lib/auth-client';
import { getLocale } from '@/@generated/paraglide/runtime';
import type { UserRole } from './navigation.config';
import * as m from '@/@generated/paraglide/messages';

interface UserMenuProps {
  role: UserRole;
}

export function UserMenu({ role }: UserMenuProps) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await authClient.signOut();
    void navigate({ to: '/' });
  };
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
      <DropdownMenuTrigger render={<Button variant="ghost" size="icon" />}>
        <User className="h-5 w-5 text-text-primary 2xl:h-7 2xl:w-7" />
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end">
        <DropdownMenuItem>
          <Link to="/$locale/profile" params={{ locale }}>
            {m.button_profile()}
          </Link>
        </DropdownMenuItem>

        {role === 'user' && (
          <DropdownMenuItem>
            <Link to="/$locale/my-events" params={{ locale }}>
              {m.button_my_events()}
            </Link>
          </DropdownMenuItem>
        )}

        {role === 'admin' && (
          <DropdownMenuItem>
            <Link to="/$locale/admin" params={{ locale }}>
              {m.button_admin_panel()}
            </Link>
          </DropdownMenuItem>
        )}

        <DropdownMenuItem onClick={() => void handleLogout()}>Logout</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
