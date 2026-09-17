import { Link, useNavigate, useRouter } from '@tanstack/react-router';

import { Button, buttonVariants } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { User } from 'lucide-react';
import { authClient } from '@/lib/auth-client';
import { UserAvatar } from '@/components/UserAvatar';
import type { UserRole } from './navigation.config';
import * as m from '@/@generated/paraglide/messages';
import { toast } from 'sonner';

interface UserMenuProps {
  role: UserRole;
  name?: string | null;
  username?: string | null;
  avatar?: string | null;
}

export function UserMenu({ role, name, username, avatar }: UserMenuProps) {
  const navigate = useNavigate();
  const router = useRouter();

  const handleLogout = async () => {
    const signOut = authClient.signOut().then(({ error }) => {
      if (error) throw new Error(error.message ?? m.toast_server_response_error());
    });
    toast.promise(signOut, {
      loading: m.toast_working(),
      success: m.toast_complete(),
      error: (error) => (error instanceof Error ? error.message : String(error)),
    });
    await signOut;
    await navigate({ to: '/' });
    await router.invalidate();
  };

  // Visitor is not logged in
  if (role === 'visitor') {
    return (
      <Link
        to="/login"
        aria-label="Log in"
        className={buttonVariants({
          variant: 'ghost',
          size: 'icon',
        })}
      >
        <User className="h-5 w-5 text-text-primary 2xl:h-7 2xl:w-7" aria-hidden="true" />
      </Link>
    );
  }

  // Shows the user menu for logged in users (user and admin)
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={<Button aria-label="Open Profile Menu" variant="ghost" size="icon" />}
      >
        <UserAvatar name={name} username={username} avatar={avatar} className="size-7 2xl:size-9" />
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end">
        <DropdownMenuItem
          className="cursor-pointer"
          render={<Link to="/profile" className="w-full" />}
        >
          {m.button_profile()}
        </DropdownMenuItem>

        {role === 'user' && (
          <DropdownMenuItem
            className="cursor-pointer"
            render={<Link to="/my-events" className="w-full" />}
          >
            {m.button_my_events()}
          </DropdownMenuItem>
        )}

        {role === 'user' && (
          <DropdownMenuItem
            className="cursor-pointer"
            render={<Link to="/my-tickets" className="w-full" />}
          >
            {m.button_my_tickets()}
          </DropdownMenuItem>
        )}

        {role === 'admin' && (
          <DropdownMenuItem
            className="cursor-pointer"
            render={<Link to="/admin" className="w-full" />}
          >
            {m.button_admin_panel()}
          </DropdownMenuItem>
        )}

        <DropdownMenuItem className="cursor-pointer" onClick={() => void handleLogout()}>
          {m.button_logout()}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
