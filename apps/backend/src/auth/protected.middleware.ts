import { Injectable } from '@nestjs/common';
import { TRPCError } from '@trpc/server';
import type { MiddlewareOptions, TRPCMiddleware } from 'nestjs-trpc';

@Injectable()
export class ProtectedMiddleware implements TRPCMiddleware {
  async use(opts: MiddlewareOptions) {
    const { ctx, next } = opts;
    const { session, user } = ctx as { session: unknown; user: unknown };

    if (!session || !user) {
      throw new TRPCError({ code: 'UNAUTHORIZED' });
    }

    return next({ ctx: { session, user } });
  }
}
