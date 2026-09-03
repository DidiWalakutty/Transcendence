import { createRouter as createTanStackRouter } from '@tanstack/react-router';
import { routeTree } from './routeTree.gen';
import { deLocalizeUrl, localizeUrl } from './@generated/paraglide/runtime';

import type { ReactNode } from 'react';
import { setupRouterSsrQueryIntegration } from '@tanstack/react-router-ssr-query';
import TanstackQueryProvider, { getContext } from './integrations/tanstack-query/root-provider';

export function getRouter() {
  const context = getContext();

  const router = createTanStackRouter({
    routeTree,
    context,
    scrollRestoration: true,
    defaultPreload: 'intent',
    defaultPreloadStaleTime: 0,
    rewrite: {
      input: ({ url }) => deLocalizeUrl(url),
      output: ({ url }) => localizeUrl(url),
    },

    Wrap: (props: { children: ReactNode }) => {
      return <TanstackQueryProvider context={context}>{props.children}</TanstackQueryProvider>;
    },
  });

  setupRouterSsrQueryIntegration({ router, queryClient: context.queryClient });

  return router;
}

declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof getRouter>;
  }
}
