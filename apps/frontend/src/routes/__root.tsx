import { HeadContent, Link, Scripts, createRootRouteWithContext } from '@tanstack/react-router';
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools';
import { TanStackDevtools } from '@tanstack/react-devtools';
import { useEffect } from 'react';

import TanStackQueryDevtools from '../integrations/tanstack-query/devtools';

import { getLocale } from '@/@generated/paraglide/runtime';
import * as m from '@/@generated/paraglide/messages';

import appCss from '../styles.css?url';

import type { QueryClient } from '@tanstack/react-query';

import type { AppRouter } from '@repo/schemas/trpc';
import type { TRPCOptionsProxy } from '@trpc/tanstack-react-query';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Footer } from '@/components/Footer';
import { ChatWidget } from '@/components/chat/ChatWidget';
import { Navbar } from '@/components/navigation/Navbar';
import { buttonVariants } from '@/components/ui/button';

import { Toaster } from 'sonner';
import { getAuthSession } from '@/lib/auth-session.functions';

interface MyRouterContext {
  queryClient: QueryClient;

  trpc: TRPCOptionsProxy<AppRouter>;
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  beforeLoad: async () => {
    const session = await getAuthSession();

    // Other redirect strategies are possible; see
    // https://github.com/TanStack/router/tree/main/examples/react/i18n-paraglide#offline-redirect
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('lang', getLocale());
    }

    return { session };
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
        title: 'Eventra',
      },
      {
        name: 'theme-color',
        content: '#173a40',
      },
    ],
    links: [
      {
        rel: 'icon',
        type: 'image/x-icon',
        href: '/favicon.ico',
      },
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
  notFoundComponent: NotFoundPage,
  shellComponent: RootDocument,
});

function NotFoundPage() {
  return (
    <section className="mx-auto flex min-h-[60vh] w-full max-w-3xl flex-col items-center justify-center gap-6 px-6 py-16 text-center">
      <p className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">404</p>
      <div className="grid gap-3">
        <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">{m.not_found_title()}</h1>
        <p className="text-muted-foreground">{m.not_found_description()}</p>
      </div>
      <Link to="/" className={buttonVariants({ size: 'lg' })}>
        {m.not_found_back_home()}
      </Link>
    </section>
  );
}

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
        <TooltipProvider>
          <div className="flex min-h-screen flex-col">
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
            <ChatWidget />
          </div>
        </TooltipProvider>
        <Toaster closeButton richColors position="top-right" />
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
