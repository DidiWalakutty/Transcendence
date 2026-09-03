import { createAuthClient } from 'better-auth/react';
import { adminClient, usernameClient, twoFactorClient } from 'better-auth/client/plugins';
import { env } from '@/env';

const baseURL =
  typeof window === 'undefined'
    ? (env.SERVER_URL ?? env.VITE_API_URL ?? 'http://localhost:3001')
    : (env.VITE_API_URL ?? 'http://localhost:3001');

export const authClient = createAuthClient({
  baseURL,
  plugins: [adminClient(), usernameClient(), twoFactorClient()],
  fetchOptions: {
    credentials: 'include',
  },
});
