import { redirect } from '@tanstack/react-router';
import { hasAdminRole } from '@repo/schemas/users';

type SessionLike = { user: { role?: string | null } } | null | undefined;

export function requireAuth(session: SessionLike) {
  if (!session) {
    throw redirect({ to: '/login' });
  }
}

export function requireAdmin(session: SessionLike) {
  requireAuth(session);
  if (!hasAdminRole(session?.user ?? null)) {
    throw redirect({ to: '/' });
  }
}
