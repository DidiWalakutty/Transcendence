import { createAuthClient } from 'better-auth/react';
import { usernameClient, inferAdditionalFields, twoFactorClient } from 'better-auth/client/plugins';
import { env } from '@/env';

export const authClient = createAuthClient({
  baseURL: env.VITE_API_URL ?? 'http://localhost:3001',
  plugins: [
    usernameClient(),
    twoFactorClient(),
    inferAdditionalFields({
      user: {
        isAdministrator: { type: 'boolean', input: false },
      },
    }),
  ],
  fetchOptions: {
    credentials: 'include',
  },
});
