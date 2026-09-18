import type { QueryClient } from '@tanstack/react-query';

type TrpcLike = {
  events: {
    getMyRegisteredEvents: { queryKey: () => readonly unknown[] };
    getEvents: { queryKey: () => readonly unknown[] };
    getFilteredEvents: { queryKey: (input: object) => readonly unknown[] };
    getFeaturedEvents: { queryKey: () => readonly unknown[] };
  };
  registrations: {
    getMyRegistration: { queryKey: (input: { id: string }) => readonly unknown[] };
    getAvailableTickets: { queryKey: (input: { id: string }) => readonly unknown[] };
    getEventAttendees: { queryKey: (input: { id: string }) => readonly unknown[] };
    getRegistrationStatus: { queryKey: (input: { id: string }) => readonly unknown[] };
  };
};

export async function invalidateEventCaches(
  queryClient: QueryClient,
  trpc: TrpcLike,
  eventId?: string,
): Promise<void> {
  const tasks: Promise<void>[] = [
    queryClient.invalidateQueries({ queryKey: trpc.events.getMyRegisteredEvents.queryKey() }),
    queryClient.invalidateQueries({ queryKey: trpc.events.getEvents.queryKey() }),
    queryClient.invalidateQueries({ queryKey: trpc.events.getFilteredEvents.queryKey({}) }),
    queryClient.invalidateQueries({ queryKey: trpc.events.getFeaturedEvents.queryKey() }),
  ];
  if (eventId) {
    tasks.push(
      queryClient.invalidateQueries({
        queryKey: trpc.registrations.getMyRegistration.queryKey({ id: eventId }),
      }),
      queryClient.invalidateQueries({
        queryKey: trpc.registrations.getAvailableTickets.queryKey({ id: eventId }),
      }),
      queryClient.invalidateQueries({
        queryKey: trpc.registrations.getEventAttendees.queryKey({ id: eventId }),
      }),
      queryClient.invalidateQueries({
        queryKey: trpc.registrations.getRegistrationStatus.queryKey({ id: eventId }),
      }),
    );
  }
  await Promise.all(tasks);
}

export async function invalidateEventsLists(
  queryClient: QueryClient,
  trpc: Pick<TrpcLike, 'events'>,
): Promise<void> {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: trpc.events.getMyRegisteredEvents.queryKey() }),
    queryClient.invalidateQueries({ queryKey: trpc.events.getEvents.queryKey() }),
  ]);
}
