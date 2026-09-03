import { Link, useNavigate, useRouter } from '@tanstack/react-router';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { User } from 'lucide-react';
import { authClient } from '@/lib/auth-client';
import type { UserRole } from './navigation.config';
import * as m from '@/@generated/paraglide/messages';

interface UserMenuProps {
  role: UserRole;
}

export function UserMenu({ role }: UserMenuProps) {
  const navigate = useNavigate();
  const router = useRouter();

  const handleLogout = async () => {
    await authClient.signOut();
    await navigate({ to: '/' });
    await router.invalidate();
  };

  // Visitor is not logged in
  if (role === 'visitor') {
    return (
      <Button variant="ghost" size="icon">
        <Link to="/login">
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
        <DropdownMenuItem render={<Link to="/profile" />}>{m.button_profile()}</DropdownMenuItem>

        {role === 'user' && (
          <DropdownMenuItem render={<Link to="/my-events" />}>
            {m.button_my_events()}
          </DropdownMenuItem>
        )}

        {role === 'admin' && (
          <DropdownMenuItem render={<Link to="/admin" />}>
            {m.button_admin_panel()}
          </DropdownMenuItem>
        )}

        <DropdownMenuItem onClick={() => void handleLogout()}>Logout</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
