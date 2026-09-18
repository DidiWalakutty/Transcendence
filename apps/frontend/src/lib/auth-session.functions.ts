import { createServerFn } from '@tanstack/react-start';

import { authClient } from '@/lib/auth-client';
import { getForwardedRequestHeaders } from '@/lib/forwarded-headers';

// Runs in the root route's beforeLoad, so throwing here fails the whole route
// tree: when the backend is unreachable every render throws, the CatchBoundary
// recreates the tree, and the app sits in a remount loop. An unreachable or
// unhappy backend means "no session" instead, which renders the app as a
// visitor and lets route guards redirect normally.
export const getAuthSession = createServerFn({ method: 'GET' }).handler(async () => {
  try {
    const { data, error } = await authClient.getSession({
      fetchOptions: {
        headers: getForwardedRequestHeaders(),
      },
    });

    if (error) {
      console.warn('Could not read the authentication session:', error.message ?? error);
      return null;
    }

    return data;
  } catch (error) {
    console.warn('Could not reach the authentication service:', error);
    return null;
  }
});
