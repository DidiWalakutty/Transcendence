import {
  Router,
  Query,
  Mutation,
  Subscription,
  Input,
  Options,
  Ctx,
  UseMiddlewares,
} from 'nestjs-trpc';

import { z } from 'zod';
import { Inject } from '@nestjs/common';
import {
  adminUpdateUserSchema,
  createUserSchema,
  deleteUserSchema,
  userChangedSubscriptionSchema,
  userCreatedSubscriptionSchema,
  userDeletedSubscriptionSchema,
  userUpdatedSubscriptionSchema,
  userSchema,
  updateUserSchema,
  type AdminUpdateUserDto,
  type CreateUserDto,
  type DeleteUserDto,
  type UpdateUserDto,
  type UserChangedDto,
  type UserDto,
} from '@repo/schemas/users';
import { AdminMiddleware } from '../auth/admin.middleware';
import { ProtectedMiddleware } from '../auth/protected.middleware';
import { handleUserConflict, forbiddenError, orNotFound } from '../trpc/trpc.errors';
import { hasAdminRole } from '../auth/roles';
import type { OptionalAuthCtx, ProtectedCtx } from '../auth/auth.types';
import { AUTH } from '../auth/auth.constants';
import type { Auth } from '../auth/auth.instance';
import { UsersEvents } from './users.events';
import { UsersService } from './users.service';
import { forwardSubscription } from '../trpc/subscription.helpers';

async function updateUserOrThrow(
  usersService: UsersService,
  input: UpdateUserDto | AdminUpdateUserDto,
) {
  const user = await handleUserConflict(() => usersService.update(input));
  return orNotFound(user, 'User not found');
}

@Router({ alias: 'users' })
export class UsersRouter {
  constructor(
    private readonly usersEvents: UsersEvents,
    private readonly usersService: UsersService,
    @Inject(AUTH) private readonly auth: Auth,
  ) {}

  @UseMiddlewares(ProtectedMiddleware)
  @Mutation({
    input: z.object({
      oldPassword: z.string().min(1),
      newPassword: z.string().min(8).max(100),
      confirmPassword: z.string().min(1),
    }),
    output: z.object({ success: z.boolean() }),
  })
  async changePassword(@Input() input: any, @Ctx() ctx: any) {
    if (input.newPassword !== input.confirmPassword) {
      throw forbiddenError('passwords_do_not_match');
    }

    try {
      // execution through Better Auth API
      await this.auth.api.changePassword({
        headers:
          ctx.req.headers instanceof Headers ? ctx.req.headers : new Headers(ctx.req.headers),
        body: {
          currentPassword: input.oldPassword,
          newPassword: input.newPassword,
        },
      });
      return { success: true };
    } catch {
      throw forbiddenError('invalid_current_password');
    }
  }

  @UseMiddlewares(AdminMiddleware)
  @Mutation({ input: createUserSchema, output: userSchema })
  async createUser(@Input() input: CreateUserDto) {
    return handleUserConflict(() => this.usersService.create(input));
  }

  @UseMiddlewares(ProtectedMiddleware)
  @Query({ output: userSchema.array() })
  async getUsers() {
    return this.usersService.findAll();
  }

  @UseMiddlewares(ProtectedMiddleware)
  @Query({
    input: z.object({ search: z.string().trim().max(200).optional() }),
    output: userSchema.array(),
  })
  async searchUsers(@Input() input: { search?: string }) {
    return this.usersService.searchUsers(input.search);
  }

  @Query({ output: userSchema.nullable() })
  async getMe(@Ctx() ctx: OptionalAuthCtx) {
    if (!ctx.user) return null;
    return (await this.usersService.findById(ctx.user.id)) ?? null;
  }

  @UseMiddlewares(ProtectedMiddleware)
  @Mutation({ input: updateUserSchema, output: userSchema })
  async updateUser(@Input() input: UpdateUserDto, @Ctx() ctx: ProtectedCtx) {
    if (!hasAdminRole(ctx.user) && ctx.user.id !== input.id) {
      throw forbiddenError('You can only update your own profile');
    }

    return updateUserOrThrow(this.usersService, input);
  }

  @UseMiddlewares(AdminMiddleware)
  @Mutation({ input: adminUpdateUserSchema, output: userSchema })
  async adminUpdateUser(@Input() input: AdminUpdateUserDto) {
    return updateUserOrThrow(this.usersService, input);
  }

  @UseMiddlewares(AdminMiddleware)
  @Mutation({ input: deleteUserSchema, output: userSchema })
  async deleteUser(@Input() input: DeleteUserDto) {
    const user = await this.usersService.delete(input.id);
    return orNotFound(user, 'User not found');
  }

  @UseMiddlewares(AdminMiddleware)
  @Subscription({ output: userCreatedSubscriptionSchema })
  async *onUserCreated(
    @Options() opts: { signal?: AbortSignal },
  ): AsyncGenerator<UserDto, void, void> {
    yield* forwardSubscription(this.usersEvents.listenUserCreated(opts.signal));
  }

  @UseMiddlewares(AdminMiddleware)
  @Subscription({ output: userUpdatedSubscriptionSchema })
  async *onUserUpdated(
    @Options() opts: { signal?: AbortSignal },
  ): AsyncGenerator<UserDto, void, void> {
    yield* forwardSubscription(this.usersEvents.listenUserUpdated(opts.signal));
  }

  @UseMiddlewares(AdminMiddleware)
  @Subscription({ output: userDeletedSubscriptionSchema })
  async *onUserDeleted(
    @Options() opts: { signal?: AbortSignal },
  ): AsyncGenerator<UserDto, void, void> {
    yield* forwardSubscription(this.usersEvents.listenUserDeleted(opts.signal));
  }

  @UseMiddlewares(AdminMiddleware)
  @Subscription({ output: userChangedSubscriptionSchema })
  async *onUserChanged(
    @Options() opts: { signal?: AbortSignal },
  ): AsyncGenerator<UserChangedDto, void, void> {
    yield* forwardSubscription(this.usersEvents.listenUserChanged(opts.signal));
  }
}
