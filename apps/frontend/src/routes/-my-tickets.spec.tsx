import superjson from 'superjson';
import type { ComponentType, ReactNode } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createTRPCClient, httpLink } from '@trpc/client';
import { createTRPCOptionsProxy } from '@trpc/tanstack-react-query';
import type { AppRouter } from '@repo/schemas/trpc';
import type { EventDto } from '@repo/schemas/events';
import { TRPCProvider } from '../integrations/trpc/react';
import { Route } from './my-tickets';
import { Route as DetailRoute } from './events/$eventId';
import { toast } from 'sonner';

vi.mock('@tanstack/react-router', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@tanstack/react-router')>()),
  Link: ({ to, children }: { to: string; children: ReactNode }) => <a href={to}>{children}</a>,
}));
vi.mock('@/components/events/EventManagement', () => ({
  TicketManagementTable: ({
    tickets,
    onCancel,
  }: {
    tickets: EventDto[];
    onCancel: (ticket: EventDto) => void;
  }) => (
    <div>
      {tickets.map((ticket) => (
        <button key={ticket.id} onClick={() => onCancel(ticket)}>
          Cancel {ticket.title}
        </button>
      ))}
    </div>
  ),
  TicketCancelDialog: ({
    ticket,
    onConfirm,
  }: {
    ticket: EventDto | null;
    onConfirm: () => void;
  }) => (ticket ? <button onClick={onConfirm}>Confirm cancellation</button> : null),
}));
vi.mock('@/hooks/use-event-stream', () => ({ useEventStream: () => ({ connected: true }) }));
vi.mock('sonner', () => ({
  toast: { loading: vi.fn(), dismiss: vi.fn(), success: vi.fn(), error: vi.fn(), info: vi.fn() },
}));

const event: EventDto = {
  id: '64de8cd7-e120-4ad1-b849-4b386f31d599',
  organizerId: 'organizer',
  title: 'Board games',
  description: 'Play together',
  category: ['games'],
  location: 'Amsterdam',
  address: 'Dam 1',
  date: '2026-10-01',
  time: '19:00',
  image: 'PLACEHOLDER',
  maxCapacity: 20,
};
const clients: QueryClient[] = [];
afterEach(() => {
  cleanup();
  clients.forEach((client) => client.clear());
  clients.length = 0;
  vi.clearAllMocks();
  vi.restoreAllMocks();
});

function setup({
  tickets = [event],
  expired = false,
  page = 'tickets',
}: { tickets?: EventDto[]; expired?: boolean; page?: 'tickets' | 'detail' } = {}) {
  let currentTickets = tickets;
  const calls: string[] = [];
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, staleTime: 30_000 }, mutations: { retry: false } },
  });
  clients.push(queryClient);
  const trpcClient = createTRPCClient<AppRouter>({
    links: [
      httpLink({
        url: 'http://test/trpc',
        transformer: superjson,
        fetch: async (url, init) => {
          const requestUrl =
            typeof url === 'string' ? url : url instanceof URL ? url.href : url.url;
          const path = new URL(requestUrl).pathname.split('/').pop()!;
          const mutation = init?.method === 'POST';
          calls.push(path);
          if (mutation && expired) {
            if (path === 'events.cancelRegistration')
              return new Response(JSON.stringify({ result: { data: superjson.serialize(false) } }));
            return new Response(
              JSON.stringify({
                error: {
                  message: 'Not logged in',
                  code: -32001,
                  data: { code: 'UNAUTHORIZED', httpStatus: 401 },
                },
              }),
              { status: 401 },
            );
          }
          if (mutation) currentTickets = path === 'registrations.register' ? [event] : [];
          const registration = {
            eventId: event.id,
            userId: 'user',
            status: currentTickets.length ? 'active' : 'canceled',
          };
          const data = mutation
            ? registration
            : path === 'eventCreation.getEventById'
              ? event
              : path === 'users.getMe'
                ? { id: 'user' }
                : path === 'registrations.getAvailableTickets'
                  ? event.maxCapacity - currentTickets.length
                  : path === 'registrations.getMyRegistration'
                    ? currentTickets.length
                      ? registration
                      : null
                    : currentTickets;
          return new Response(JSON.stringify({ result: { data: superjson.serialize(data) } }));
        },
      }),
    ],
  });
  const trpc = createTRPCOptionsProxy({ client: trpcClient, queryClient });
  const registrationKey = trpc.registrations.getMyRegistration.queryKey({ id: event.id });
  const availabilityKey = trpc.registrations.getAvailableTickets.queryKey({ id: event.id });
  queryClient.setQueryData(
    registrationKey,
    tickets.length ? { eventId: event.id, userId: 'user', status: 'active' } : null,
  );
  queryClient.setQueryData(availabilityKey, tickets.length ? 0 : event.maxCapacity);
  const ticketsKey = trpc.events.getMyRegisteredEvents.queryKey();
  queryClient.setQueryData(ticketsKey, tickets);
  vi.spyOn(DetailRoute, 'useParams').mockReturnValue({ eventId: event.id });
  const Page = (
    page === 'tickets' ? Route.options.component : DetailRoute.options.component
  ) as ComponentType;
  render(
    <QueryClientProvider client={queryClient}>
      <TRPCProvider trpcClient={trpcClient} queryClient={queryClient}>
        <Page />
      </TRPCProvider>
    </QueryClientProvider>,
  );
  return { queryClient, calls, registrationKey, availabilityKey, ticketsKey };
}

async function cancel() {
  fireEvent.click(await screen.findByRole('button', { name: 'Cancel Board games' }));
  fireEvent.click(screen.getByRole('button', { name: 'Confirm cancellation' }));
}

describe('My Tickets', () => {
  it('offers event browsing when the user has no tickets', async () => {
    setup({ tickets: [] });
    expect((await screen.findByRole('link', { name: /browse events/i })).getAttribute('href')).toBe(
      '/events',
    );
  });

  it('does not close cancellation as successful after the session expires', async () => {
    const { queryClient } = setup({ expired: true });
    await cancel();
    await waitFor(() =>
      expect(queryClient.getMutationCache().getAll()[0]?.state.status).toBe('error'),
    );
    expect(screen.getByRole('button', { name: 'Confirm cancellation' })).toBeTruthy();
  });

  it('invalidates event registration and availability after cancellation', async () => {
    const { queryClient, registrationKey, availabilityKey } = setup();
    await cancel();
    await waitFor(() =>
      expect(queryClient.getMutationCache().getAll()[0]?.state.status).toBe('success'),
    );
    expect(queryClient.getQueryState(registrationKey)?.isInvalidated).toBe(true);
    expect(queryClient.getQueryState(availabilityKey)?.isInvalidated).toBe(true);
  });
  it('leaves mutation notifications to the shared cache', async () => {
    const { queryClient } = setup();
    await cancel();
    await waitFor(() =>
      expect(queryClient.getMutationCache().getAll()[0]?.state.status).toBe('success'),
    );
    expect(toast.loading).not.toHaveBeenCalled();
    expect(toast.success).not.toHaveBeenCalled();
  });

  it('refreshes My Tickets after registering from the event page', async () => {
    const { queryClient, ticketsKey, calls } = setup({ tickets: [], page: 'detail' });
    fireEvent.click(await screen.findByRole('button', { name: /get ticket/i }));
    await waitFor(() =>
      expect(queryClient.getMutationCache().getAll()[0]?.state.status).toBe('success'),
    );
    expect(calls).toContain('registrations.register');
    expect(queryClient.getQueryState(ticketsKey)?.isInvalidated).toBe(true);
  });

  it('refreshes My Tickets after cancelling from the event page', async () => {
    const { queryClient, ticketsKey, calls } = setup({ page: 'detail' });
    fireEvent.click(await screen.findByRole('button', { name: /cancel registration/i }));
    await waitFor(() =>
      expect(queryClient.getMutationCache().getAll()[0]?.state.status).toBe('success'),
    );
    expect(calls).toContain('registrations.cancel');
    expect(queryClient.getQueryState(ticketsKey)?.isInvalidated).toBe(true);
  });
});
