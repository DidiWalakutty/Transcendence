import { useQueryClient } from '@tanstack/react-query';
import { useSubscription } from '@trpc/tanstack-react-query';
import type { UserDto } from '@repo/schemas/users';
import { useTRPC } from '@/integrations/trpc/react';

/**
 * Keeps the admin user directory current from the three user subscriptions the
 * backend already publishes. Admin-only: the procedures are behind
 * AdminMiddleware, so mount this on the dashboard and nowhere else.
 */
export function useUserStream() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const usersKey = trpc.users.getUsers.queryKey();

  const patch = (apply: (users: UserDto[]) => UserDto[]) => {
    queryClient.setQueryData<UserDto[]>(usersKey, (users) => apply(users ?? []));
  };

  useSubscription(
    trpc.users.onUserCreated.subscriptionOptions(undefined, {
      onData: (user: UserDto) =>
        patch((users) => (users.some((it) => it.id === user.id) ? users : [...users, user])),
    }),
  );

  useSubscription(
    trpc.users.onUserUpdated.subscriptionOptions(undefined, {
      onData: (user: UserDto) =>
        patch((users) => users.map((it) => (it.id === user.id ? user : it))),
    }),
  );

  useSubscription(
    trpc.users.onUserDeleted.subscriptionOptions(undefined, {
      onData: (user: UserDto) => patch((users) => users.filter((it) => it.id !== user.id)),
    }),
  );
}
