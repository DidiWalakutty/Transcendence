import type { ReactNode } from 'react';
import { QueryClient } from '@tanstack/react-query';
import superjson from 'superjson';
import { createTRPCClient, httpBatchLink, httpSubscriptionLink, splitLink } from '@trpc/client';
import { createTRPCOptionsProxy } from '@trpc/tanstack-react-query';
import { createServerOnlyFn } from '@tanstack/react-start';
import { getRequestHeader } from '@tanstack/react-start/server';

import type { AppRouter } from '@repo/schemas/trpc';
import { TRPCProvider } from '@/integrations/trpc/react';
import { getApiBaseUrl } from '@/lib/api-base-url';
import * as m from '@/@generated/paraglide/messages';

import { MutationCache } from '@tanstack/react-query';
import { toast } from 'sonner';

function getUrl() {
  return `${getApiBaseUrl() ?? ''}/api/trpc`;
}

async function fetchWithCredentials(input: RequestInfo | URL, init?: RequestInit) {
  const response = await fetch(input, { ...init, credentials: 'include' });
  if (response.status === 413) {
    throw new Error(m.toast_request_too_large());
  }
  return response;
}

type ToastId = ReturnType<typeof toast.loading>;

const mutationToastIds = new WeakMap<object, ToastId>();

function mutationPath(key: readonly unknown[] | undefined): string {
  const parts: string[] = [];
  const visit = (value: unknown) => {
    if (typeof value === 'string') parts.push(value.toLowerCase());
    else if (Array.isArray(value)) value.forEach(visit);
  };
  visit(key);
  return parts.join('.');
}

function mutationToastMessages(key: readonly unknown[] | undefined) {
  const path = mutationPath(key);
  if (path.includes('delete') || path.includes('remove')) {
    return { loading: m.toast_deleting(), success: m.toast_deleted() };
  }
  if (path.includes('create') || path.includes('add') || path.includes('signup')) {
    return { loading: m.toast_creating(), success: m.toast_created() };
  }
  if (path.includes('update') || path.includes('reset')) {
    return { loading: m.toast_saving(), success: m.toast_saved() };
  }
  return { loading: m.toast_working(), success: m.toast_complete() };
}

function mutationErrorMessage(error: unknown): string {
  if (!(error instanceof Error)) return String(error);
  if (error.message.includes('Unable to transform response from server')) {
    return m.toast_server_response_error();
  }
  return error.message;
}

const getServerRequestHeaders = createServerOnlyFn(() => {
  const cookie = getRequestHeader('cookie');
  return cookie ? { cookie } : {};
});

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
        headers: () => (typeof window === 'undefined' ? getServerRequestHeaders() : {}),
      }),
    }),
  ],
});

export function getContext() {
  const queryClient = new QueryClient({
    mutationCache: new MutationCache({
      onMutate: (_variables, mutation) => {
        const messages = mutationToastMessages(mutation.options.mutationKey);
        mutationToastIds.set(mutation, toast.loading(messages.loading));
      },
      onSuccess: (_data, _variables, _context, mutation) => {
        const messages = mutationToastMessages(mutation.options.mutationKey);
        toast.success(messages.success, { id: mutationToastIds.get(mutation) });
        mutationToastIds.delete(mutation);
      },
      onError: (error, _variables, _context, mutation) => {
        toast.error(mutationErrorMessage(error), { id: mutationToastIds.get(mutation) });
        mutationToastIds.delete(mutation);
      },
    }),
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: 30_000,
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
