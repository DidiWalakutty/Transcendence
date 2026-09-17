import { createAuthClient } from 'better-auth/react';
import { adminClient, usernameClient, twoFactorClient } from 'better-auth/client/plugins';
import { getApiBaseUrl } from '@/lib/api-base-url';

export const authClient = createAuthClient({
  // `undefined` makes Better Auth use the page's own origin (`/api/auth`).
  baseURL: getApiBaseUrl(),
  plugins: [adminClient(), usernameClient(), twoFactorClient()],
  fetchOptions: {
    credentials: 'include',
  },
});
