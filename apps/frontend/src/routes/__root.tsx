import { HeadContent, Scripts, createRootRouteWithContext } from '@tanstack/react-router';
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools';
import { TanStackDevtools } from '@tanstack/react-devtools';
import { useEffect } from 'react';

import TanStackQueryDevtools from '../integrations/tanstack-query/devtools';

import { getLocale } from '@/@generated/paraglide/runtime';

import appCss from '../styles.css?url';

import type { QueryClient } from '@tanstack/react-query';

import type { AppRouter } from '@repo/schemas/trpc';
import type { TRPCOptionsProxy } from '@trpc/tanstack-react-query';
import { TooltipProvider } from '@/components/ui/tooltip';

interface MyRouterContext {
  queryClient: QueryClient;

  trpc: TRPCOptionsProxy<AppRouter>;
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  beforeLoad: async () => {
    // Other redirect strategies are possible; see
    // https://github.com/TanStack/router/tree/main/examples/react/i18n-paraglide#offline-redirect
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('lang', getLocale());
    }
  },

  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'TanStack Start Starter',
      },
      {
        name: 'theme-color',
        content: '#173a40',
      },
    ],
    links: [
      {
        rel: 'stylesheet',
        href: appCss,
      },
      {
        rel: 'manifest',
        href: '/manifest.json',
      },
    ],
  }),
  shellComponent: RootDocument,
});

function PwaRegistration() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) {
      return;
    }

    const serviceWorkerUrl = import.meta.env.DEV ? '/dev-sw.js?dev-sw' : '/sw.js';

    void navigator.serviceWorker.register(serviceWorkerUrl, {
      scope: '/',
      type: import.meta.env.DEV ? 'module' : 'classic',
    });
  }, []);

  return null;
}

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang={getLocale()}>
      <head>
        <HeadContent />
      </head>
      <body>
        <PwaRegistration />
        <TooltipProvider>{children}</TooltipProvider>
        <TanStackDevtools
          config={{
            position: 'bottom-right',
          }}
          plugins={[
            {
              name: 'Tanstack Router',
              render: <TanStackRouterDevtoolsPanel />,
            },
            TanStackQueryDevtools,
          ]}
        />
        <Scripts />
      </body>
    </html>
  );
}
