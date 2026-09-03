import { createServerFn } from '@tanstack/react-start';
import { getRequestHeader } from '@tanstack/react-start/server';

import { authClient } from '@/lib/auth-client';

export const getAuthSession = createServerFn({ method: 'GET' }).handler(async () => {
  const cookie = getRequestHeader('cookie');
  const { data, error } = await authClient.getSession({
    fetchOptions: {
      headers: cookie ? { cookie } : undefined,
    },
  });

  if (error) {
    throw new Error(error.message ?? 'Unable to retrieve the authentication session');
  }

  return data;
});
