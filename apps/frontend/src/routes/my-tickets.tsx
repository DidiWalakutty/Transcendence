import { createFileRoute, redirect } from '@tanstack/react-router';
import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { EventDto } from '@repo/schemas/events';
import { Ticket, Search } from 'lucide-react';

import * as m from '@/@generated/paraglide/messages';
import { useTRPC } from '@/integrations/trpc/react';
import { TicketManagementTable, TicketCancelDialog } from '@/components/events/EventManagement';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { toast } from 'sonner';

export const Route = createFileRoute('/my-tickets')({
  beforeLoad: ({ context: { session } }) => {
    if (!session) {
      throw redirect({ to: '/login' });
    }
  },
  loader: async ({ context }) => {
    await context.queryClient.query({
      ...context.trpc.events.getMyRegisteredEvents.queryOptions(),
      staleTime: 'static',
    });
  },
  component: MyTicketsPage,
});

function MyTicketsPage() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [cancelTarget, setCancelTarget] = useState<EventDto | null>(null);

  const myTicketsQuery = useQuery(trpc.events.getMyRegisteredEvents.queryOptions());

  const cancelTicket = useMutation(
    trpc.events.cancelRegistration.mutationOptions({
      onMutate: () => {
        return toast.loading(m.toast_deleting());
      },
      onSuccess: async (_, __, toastId) => {
        toast.dismiss(toastId);
        toast.success(m.toast_deleted());
        setCancelTarget(null);
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: trpc.events.getMyRegisteredEvents.queryKey() }),
          queryClient.invalidateQueries({ queryKey: trpc.events.getEvents.queryKey() }),
        ]);
      },
      onError: (error, __, toastId) => {
        toast.dismiss(toastId);
        toast.error(error.message);
      },
    }),
  );

  const tickets = useMemo(() => {
    const query = search.trim().toLowerCase();
    return (myTicketsQuery.data ?? []).filter((ticket) =>
      [ticket.title, ticket.location, ticket.address, ...ticket.category].some((value) =>
        value.toLowerCase().includes(query),
      ),
    );
  }, [search, myTicketsQuery.data]);

  if (myTicketsQuery.isPending) {
    return <Spinner className="mx-auto my-24" />;
  }

  if (myTicketsQuery.error) {
    return (
      <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6">
        <Alert variant="destructive">
          <AlertDescription>{myTicketsQuery.error.message}</AlertDescription>
        </Alert>
      </div>
    );
  }

  const totalTickets = myTicketsQuery.data?.length ?? 0;

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6">
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">{m.button_my_tickets()}</h1>
          <p className="text-muted-foreground">{m.my_tickets_page_subtitle()}</p>
        </div>
      </div>

      <Card size="sm" className="mb-8 sm:max-w-xs">
        <CardHeader>
          <CardDescription>{m.button_my_tickets()}</CardDescription>
          <CardTitle className="flex items-center justify-between text-2xl">
            {totalTickets}
            <Ticket className="size-5 text-primary" />
          </CardTitle>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{m.my_tickets_card_title()}</CardTitle>
          <CardDescription>{m.my_tickets_card_description()}</CardDescription>
          <div className="relative mt-4 max-w-md">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={m.my_tickets_search_placeholder()}
              aria-label={m.my_tickets_search_placeholder()}
              className="pl-9"
            />
          </div>
        </CardHeader>
        <CardContent>
          <TicketManagementTable tickets={tickets} onCancel={setCancelTarget} />
          {tickets.length === 0 && (
            <p className="py-10 text-center text-muted-foreground">{m.my_tickets_no_results()}</p>
          )}
        </CardContent>
      </Card>

      <TicketCancelDialog
        ticket={cancelTarget}
        pending={cancelTicket.isPending}
        onCancel={() => setCancelTarget(null)}
        onConfirm={() => cancelTarget && cancelTicket.mutate({ eventId: cancelTarget.id })}
      />
    </div>
  );
}
