import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSubscription } from '@trpc/tanstack-react-query';
import type { PresenceChangedDto } from '@repo/schemas/presence';
import { useTRPC } from '@/integrations/trpc/react';

export function usePresence(userIds: string[]) {
  const trpc = useTRPC();
  const [onlineIds, setOnlineIds] = useState<Set<string>>(new Set());

  const snapshotQuery = useQuery(
    trpc.presence.getOnlineUserIds.queryOptions({ userIds }, { enabled: userIds.length > 0 }),
  );

  useEffect(() => {
    setOnlineIds(new Set(snapshotQuery.data ?? []));
  }, [snapshotQuery.data]);

  useSubscription(
    trpc.presence.onPresenceChanged.subscriptionOptions(undefined, {
      enabled: userIds.length > 0,
      onData: (change: PresenceChangedDto) => {
        setOnlineIds((previous) => {
          const next = new Set(previous);

          if (change.online) {
            next.add(change.userId);
          } else {
            next.delete(change.userId);
          }

          return next;
        });
      },
    }),
  );

  return onlineIds;
}

export function usePresenceConnection(enabled: boolean) {
  const trpc = useTRPC();

  useSubscription(
    trpc.presence.onPresenceChanged.subscriptionOptions(undefined, {
      enabled,
    }),
  );
}
