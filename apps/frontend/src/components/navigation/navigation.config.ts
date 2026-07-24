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
  href: string;
}

/**
 * Main Navigation Links
 *
 * These are displayed in the navbar.
 *
 * User-specific actions such as Profile and Logout belong in UserMenu.tsx.
 */
export const navigationItems: Record<UserRole, NavigationItem[]> = {
  visitor: [{ label: 'Events', href: '/events' }],
  user: [
    { label: 'Events', href: '/events' },
    { label: 'Create Event', href: '/create-event' },
  ],
  admin: [
    { label: 'Events', href: '/events' },
    { label: 'Create Event', href: '/create-event' },
    { label: 'Admin Dashboard', href: '/admin' },
  ],
};
