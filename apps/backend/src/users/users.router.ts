import { Router, Query, Mutation, Subscription, Input, Options, Ctx } from 'nestjs-trpc';

import {
  createUserSchema,
  deleteUserSchema,
  userCreatedSubscriptionSchema,
  userDeletedSubscriptionSchema,
  userUpdatedSubscriptionSchema,
  userSchema,
  updateUserSchema,
  type CreateUserDto,
  type DeleteUserDto,
  type UpdateUserDto,
  type UserDto,
} from '@repo/schemas/users';
import { conflictError, notFoundError } from '../trpc/trpc.errors';
import { UserEmailAlreadyExistsError } from './errors/user-email-already-exists.error';
import { UsersEvents } from './users.events';
import { UsersService } from './users.service';
import { NotificationService } from '../notification/notification.service.js';

@Router({ alias: 'users' })
export class UsersRouter {
  constructor(
    private readonly usersEvents: UsersEvents,
    private readonly usersService: UsersService,
    private readonly notificationService: NotificationService,
  ) {}

  @Mutation({ input: createUserSchema, output: userSchema })
  async createUser(@Input() input: CreateUserDto, @Ctx() ctx: { req: import('express').Request }) {
    try {
      const user = await this.usersService.create(input);
      const rawBody = ctx.req.body;
      const userLang = rawBody?.json?.preferedLanguage || rawBody?.preferedLanguage || 'en';

      this.notificationService
        .sendWelcomeEmail(user.email, user.name, userLang)
        .catch((err) => console.error('Background Notification Dispatch Failure:', err));

      return user;
    } catch (error) {
      if (error instanceof UserEmailAlreadyExistsError) {
        throw conflictError(error.message);
      }

      throw error;
    }
  }

  @Query({ output: userSchema.array() })
  async getUsers() {
    return this.usersService.findAll();
  }

  @Query({ output: userSchema.nullable() })
  async getMe(@Ctx() ctx: { user: { id: string } | null }) {
    if (!ctx.user) return null;
    return (await this.usersService.findById(ctx.user.id)) ?? null;
  }

  @Mutation({ input: updateUserSchema, output: userSchema })
  async updateUser(@Input() input: UpdateUserDto) {
    try {
      const user = await this.usersService.update(input);

      if (!user) {
        throw notFoundError('User not found');
      }

      return user;
    } catch (error) {
      if (error instanceof UserEmailAlreadyExistsError) {
        throw conflictError(error.message);
      }

      throw error;
    }
  }

  @Mutation({ input: deleteUserSchema, output: userSchema })
  async deleteUser(@Input() input: DeleteUserDto) {
    const user = await this.usersService.delete(input.id);

    if (!user) {
      throw notFoundError('User not found');
    }

    return user;
  }

  @Subscription({ output: userCreatedSubscriptionSchema })
  async *onUserCreated(
    @Options() opts: { signal?: AbortSignal },
  ): AsyncGenerator<UserDto, void, void> {
    for await (const user of this.usersEvents.listenUserCreated(opts.signal)) {
      yield user;
    }
  }

  @Subscription({ output: userUpdatedSubscriptionSchema })
  async *onUserUpdated(
    @Options() opts: { signal?: AbortSignal },
  ): AsyncGenerator<UserDto, void, void> {
    for await (const user of this.usersEvents.listenUserUpdated(opts.signal)) {
      yield user;
    }
  }

  @Subscription({ output: userDeletedSubscriptionSchema })
  async *onUserDeleted(
    @Options() opts: { signal?: AbortSignal },
  ): AsyncGenerator<UserDto, void, void> {
    for await (const user of this.usersEvents.listenUserDeleted(opts.signal)) {
      yield user;
    }
  }
}
