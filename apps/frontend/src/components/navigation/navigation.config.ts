/**
 * Navigation Configuration
 *
 * This file defines which navigation links are available for each user role.
 * Later, this will be driven by the backend, but for now, we will hardcode the
 * navigation items for each role.
 */

export type UserRole = 'visitor' | 'user' | 'admin';

export interface NavigationItem {
  label: string;
  href: '/$locale/events' | '/$locale/create-event' | '/$locale/admin';
}

/**
 * Main Navigation Links
 * These are displayed in the navbar.
 * Later, this can be replaced by backend-driven permissions
 * User-specific actions such as Profile and Logout belong in UserMenu.tsx.
 */
export const navigationItems: Record<UserRole, NavigationItem[]> = {
  visitor: [{ label: 'Events', href: '/$locale/events' }],
  user: [
    { label: 'Events', href: '/$locale/events' },
    { label: 'Create Event', href: '/$locale/create-event' },
  ],
  admin: [
    { label: 'Events', href: '/$locale/events' },
    { label: 'Create Event', href: '/$locale/create-event' },
    { label: 'Admin Dashboard', href: '/$locale/admin' },
  ],
};
