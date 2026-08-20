import { Router, Query, Subscription, Input, Options, Ctx } from 'nestjs-trpc';
import { z } from 'zod';

import {
  getOnlineUserIdsSchema,
  presenceChangedSubscriptionSchema,
  type GetOnlineUserIdsDto,
  type PresenceChangedDto,
} from '@repo/schemas/presence';
import { unauthorizedError } from '../trpc/trpc.errors';
import { PresenceEvents } from './presence.events';
import { PresenceService } from './presence.service';

@Router({ alias: 'presence' })
export class PresenceRouter {
  constructor(
    private readonly presenceService: PresenceService,
    private readonly presenceEvents: PresenceEvents,
  ) {}

  @Query({ input: getOnlineUserIdsSchema, output: z.uuid().array() })
  getOnlineUserIds(
    @Input() input: GetOnlineUserIdsDto,
    @Ctx() ctx: { user: { id: string } | null },
  ) {
    if (!ctx.user) throw unauthorizedError('Not logged in');
    return this.presenceService.getOnlineUserIds(input.userIds);
  }

  @Subscription({ output: presenceChangedSubscriptionSchema })
  async *onPresenceChanged(
    @Ctx() ctx: { user: { id: string } | null },
    @Options() opts: { signal?: AbortSignal },
  ): AsyncGenerator<PresenceChangedDto, void, void> {
    if (!ctx.user) throw unauthorizedError('Not logged in');

    const userId = ctx.user.id;
    const { connectionId, wasOffline } = this.presenceService.connect(userId);

    if (wasOffline) {
      this.presenceEvents.emitPresenceChanged({ userId, online: true });
    }

    try {
      for await (const change of this.presenceEvents.listenPresenceChanged(opts.signal)) {
        yield change;
      }
    } finally {
      const { becameOffline } = this.presenceService.disconnect(userId, connectionId);

      if (becameOffline) {
        this.presenceEvents.emitPresenceChanged({ userId, online: false });
      }
    }
  }
}
