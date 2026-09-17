/**
 * Navigation Configuration
 *
 * This file defines which navigation links are available for each user role.
 * Later, this will be driven by the backend, but for now, we will hardcode the
 * navigation items for each role.
 */

export type UserRole = 'visitor' | 'user' | 'admin';

export interface NavigationItem {
  label: () => string;
  href: '/events' | '/create-event';
}

/**
 * Main Navigation Links
 * These are displayed in the navbar.
 * Later, this can be replaced by backend-driven permissions
 * User-specific actions such as Profile and Logout belong in UserMenu.tsx.
 */
export const navigationItems: Record<UserRole, NavigationItem[]> = {
  visitor: [{ label: m.button_all_events, href: '/events' }],
  user: [
    { label: m.button_all_events, href: '/events' },
    { label: m.button_create, href: '/create-event' },
  ],
  admin: [
    { label: m.button_all_events, href: '/events' },
    { label: m.button_create, href: '/create-event' },
  ],
};
import * as m from '@/@generated/paraglide/messages';
