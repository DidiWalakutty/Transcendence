import type { ReactNode } from 'react';
import { QueryClient } from '@tanstack/react-query';
import superjson from 'superjson';
import { createTRPCClient, httpBatchLink, httpSubscriptionLink, splitLink } from '@trpc/client';
import { createTRPCOptionsProxy } from '@trpc/tanstack-react-query';

import type { AppRouter } from '@repo/schemas/trpc';
import { TRPCProvider } from '@/integrations/trpc/react';
import { env } from '@/env';

import { MutationCache } from '@tanstack/react-query';
import { toast } from 'sonner';

function getUrl() {
  const baseUrl =
    env.VITE_API_URL ??
    (typeof window === 'undefined' ? env.SERVER_URL : undefined) ??
    'http://localhost:3001';

  return `${baseUrl}/api/trpc`;
}

function fetchWithCredentials(input: RequestInfo | URL, init?: RequestInit) {
  return fetch(input, { ...init, credentials: 'include' });
}

export const trpcClient = createTRPCClient<AppRouter>({
  links: [
    splitLink({
      condition: (op) => op.type === 'subscription',
      true: httpSubscriptionLink({
        url: getUrl(),
        transformer: superjson,
        eventSourceOptions: { withCredentials: true },
      }),
      false: httpBatchLink({
        url: getUrl(),
        transformer: superjson,
        fetch: fetchWithCredentials,
      }),
    }),
  ],
});

export function getContext() {
  const queryClient = new QueryClient({
    mutationCache: new MutationCache({
      onSuccess: (data: any, _variables, _context, mutation) => {
        // Safely extract the active tRPC endpoint pathway (e.g. ['users', 'createUser'])
        const pathArray = (mutation.options as any).mutationKey?.[0] || [];
        const pathName = Array.isArray(pathArray) ? pathArray.join('.').toLowerCase() : '';

        const entryName = data?.name || data?.title || 'Entry';

        if (pathName.includes('create')) {
          toast.success(`${entryName} was successfully created!`);
        } else if (pathName.includes('update')) {
          toast.info(`${entryName} details have been updated.`);
        } else if (pathName.includes('delete')) {
          toast.error(`${entryName} has been removed.`);
        }
      },
    }),
    defaultOptions: {
      queries: {
        retry: false,
      },
      mutations: {
        retry: false,
      },
      dehydrate: { serializeData: superjson.serialize },
      hydrate: { deserializeData: superjson.deserialize },
    },
  });

  const serverHelpers = createTRPCOptionsProxy({
    client: trpcClient,
    queryClient: queryClient,
  });
  const context = {
    queryClient,
    trpc: serverHelpers,
  };

  return context;
}

export default function TanstackQueryProvider({
  children,
  context,
}: {
  children: ReactNode;
  context: ReturnType<typeof getContext>;
}) {
  const { queryClient } = context;

  return (
    <TRPCProvider trpcClient={trpcClient} queryClient={queryClient}>
      {children}
    </TRPCProvider>
  );
}
