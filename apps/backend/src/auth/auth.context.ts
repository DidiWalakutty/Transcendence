import { Inject, Injectable } from '@nestjs/common';
import type { ContextOptions, TRPCContext } from 'nestjs-trpc';
import { fromNodeHeaders } from 'better-auth/node';
import { AUTH } from './auth.constants';
import type { Auth } from './auth.instance';

@Injectable()
export class AuthContext implements TRPCContext {
  constructor(@Inject(AUTH) private readonly auth: Auth) {}

  async create(opts: ContextOptions) {
    const { req, res } = opts;

    const session = await this.auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    return {
      req,
      res,
      session: session?.session ?? null,
      user: session?.user ?? null,
    };
  }
}
