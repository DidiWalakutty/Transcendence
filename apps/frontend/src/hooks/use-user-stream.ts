import { useQueryClient } from '@tanstack/react-query';
import { useSubscription } from '@trpc/tanstack-react-query';
import type { UserChangedDto, UserDto } from '@repo/schemas/users';
import { useTRPC } from '@/integrations/trpc/react';
import { removeById, replaceById, upsertById } from '@/lib/collection-by-id';

/**
 * Keeps the admin user directory current from a single multiplexed user
 * subscription. A previous version opened three separate SSE connections
 * (created/updated/deleted); together with the event, presence and chat
 * streams that exhausted the browser's ~6 connections-per-origin limit and
 * left no slot for mutations, so admin saves hung forever on
 * "Saving changes…".
 *
 * Admin-only: the procedure is behind AdminMiddleware, so mount this on the
 * dashboard and nowhere else.
 */
export function useUserStream() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const usersKey = trpc.users.getUsers.queryKey();

  const patch = (apply: (users: UserDto[]) => UserDto[] | undefined) => {
    queryClient.setQueryData<UserDto[]>(usersKey, (users) => apply(users ?? []) ?? users ?? []);
  };

  useSubscription(
    trpc.users.onUserChanged.subscriptionOptions(undefined, {
      onData: (change: UserChangedDto) => {
        if (change.action === 'created') patch((users) => upsertById(users, change.user));
        else if (change.action === 'updated') patch((users) => replaceById(users, change.user));
        else patch((users) => removeById(users, change.user.id));
      },
    }),
  );
}
