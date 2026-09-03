import { Injectable } from '@nestjs/common';
import { TRPCError } from '@trpc/server';
import type { MiddlewareOptions, TRPCMiddleware } from 'nestjs-trpc';

@Injectable()
export class AdminMiddleware implements TRPCMiddleware {
  async use({ ctx, next }: MiddlewareOptions) {
    const { session, user } = ctx as {
      session: unknown;
      user: { role?: string | null } | null;
    };

    if (!session || !user) {
      throw new TRPCError({ code: 'UNAUTHORIZED' });
    }

    const roles = user.role?.split(',') ?? [];
    if (!roles.includes('admin')) {
      throw new TRPCError({ code: 'FORBIDDEN', message: 'Administrator access required' });
    }

    return next({ ctx: { session, user } });
  }
}
