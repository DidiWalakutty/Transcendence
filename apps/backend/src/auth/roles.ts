import { hasAdminRole as sharedHasAdminRole } from '@repo/schemas/users';
import { forbiddenError } from '../trpc/trpc.errors';

export function hasAdminRole(user: { role?: string | null } | null | undefined): boolean {
  return sharedHasAdminRole(user);
}

export function assertAdminRole(user: { role?: string | null } | null | undefined): void {
  if (!hasAdminRole(user)) {
    throw forbiddenError('Administrator access required');
  }
}
