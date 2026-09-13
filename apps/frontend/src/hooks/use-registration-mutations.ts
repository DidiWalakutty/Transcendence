import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { CreateRegistrationDto, RegistrationDto } from '@repo/schemas/registrations';
import { useTRPC } from '@/integrations/trpc/react';

// Both the event detail page and My Tickets change the same registration data.
export function useRegistrationMutations(onCancelSuccess?: () => void) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const refreshRegistration = async (
    _registration: RegistrationDto,
    { eventId }: CreateRegistrationDto,
  ) => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: trpc.events.getMyRegisteredEvents.queryKey() }),
      queryClient.invalidateQueries({ queryKey: trpc.events.getEvents.queryKey() }),
      queryClient.invalidateQueries({ queryKey: trpc.events.getFeaturedEvents.queryKey() }),
      queryClient.invalidateQueries({
        queryKey: trpc.registrations.getMyRegistration.queryKey({ id: eventId }),
      }),
      queryClient.invalidateQueries({
        queryKey: trpc.registrations.getAvailableTickets.queryKey({ id: eventId }),
      }),
      queryClient.invalidateQueries({
        queryKey: trpc.registrations.getEventAttendees.queryKey({ id: eventId }),
      }),
    ]);
  };

  const register = useMutation(
    trpc.registrations.register.mutationOptions({ onSuccess: refreshRegistration }),
  );
  const cancel = useMutation(
    trpc.registrations.cancel.mutationOptions({
      onSuccess: async (registration, input) => {
        await refreshRegistration(registration, input);
        onCancelSuccess?.();
      },
    }),
  );

  return { register, cancel };
}
