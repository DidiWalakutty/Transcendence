import { createAuthClient } from 'better-auth/react';
import { usernameClient, inferAdditionalFields } from 'better-auth/client/plugins';
import { env } from '@/env';

export const authClient = createAuthClient({
  baseURL: env.VITE_API_URL ?? 'http://localhost:3001',
  plugins: [
    usernameClient(),
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
