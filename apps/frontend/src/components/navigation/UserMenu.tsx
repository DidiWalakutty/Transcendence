import { useNavigate } from '@tanstack/react-router';
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

interface UserMenuProps {
  role: UserRole;
}

export function UserMenu({ role }: UserMenuProps) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await authClient.signOut();
    void navigate({ to: '/' });
  };

  // Visitor is not logged in
  if (role === 'visitor') {
    return (
      <Button variant="ghost" size="icon">
        <a href="/login">
          <User className="h-5 w-5 text-text-primary 2xl:h-7 2xl:w-7" />
        </a>
      </Button>
    );
  }

  // Logged-in users/admins will become dropdown menus
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Button variant="ghost" size="icon">
          <User className="h-5 w-5 text-text-primary 2xl:h-7 2xl:w-7" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end">
        <DropdownMenuItem>
          <a href="/profile">Profile</a>
        </DropdownMenuItem>

        {role === 'user' && (
          <DropdownMenuItem>
            <a href="/my-events">My Events</a>
          </DropdownMenuItem>
        )}

        {role === 'admin' && (
          <DropdownMenuItem>
            <a href="/admin">Admin Dashboard</a>
          </DropdownMenuItem>
        )}

        <DropdownMenuItem onClick={() => void handleLogout()}>Logout</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
