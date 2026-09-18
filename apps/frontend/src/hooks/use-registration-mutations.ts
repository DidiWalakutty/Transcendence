import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { CreateRegistrationDto, RegistrationDto } from '@repo/schemas/registrations';
import { useTRPC } from '@/integrations/trpc/react';
import { invalidateEventCaches } from '@/lib/invalidation';

// Both the event detail page and My Tickets change the same registration data.
export function useRegistrationMutations(onCancelSuccess?: () => void) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const refreshRegistration = async (
    _registration: RegistrationDto,
    { eventId }: CreateRegistrationDto,
  ) => {
    await invalidateEventCaches(queryClient, trpc, eventId);
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
