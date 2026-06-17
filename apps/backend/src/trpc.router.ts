import { z } from 'zod';
import { Router, Query, Mutation, Subscription, Input, Options } from 'nestjs-trpc';
import { TRPCError } from '@trpc/server';

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
import { UsersEvents } from './users/users.events';
import { UsersService } from './users/users.service';

const todos = [
  { id: 1, name: 'Get groceries' },
  { id: 2, name: 'Buy a new phone' },
  { id: 3, name: 'Finish the project' },
];

@Router({ alias: 'example' })
export class ExampleRouter {
  constructor(
    private readonly usersEvents: UsersEvents,
    private readonly usersService: UsersService,
  ) {}

  @Query({ output: z.array(z.object({ id: z.number(), name: z.string() })) })
  getTodos() {
    return todos;
  }

  @Mutation({ input: createUserSchema, output: userSchema })
  async createUser(@Input() input: CreateUserDto) {
    try {
      return await this.usersService.create(input);
    } catch (error) {
      if (isUniqueViolation(error)) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'A user with this email already exists',
        });
      }

      throw error;
    }
  }

  @Query({ output: z.array(userSchema) })
  async getUsers() {
    return this.usersService.findAll();
  }

  @Mutation({ input: updateUserSchema, output: userSchema })
  async updateUser(@Input() input: UpdateUserDto) {
    try {
      const user = await this.usersService.update(input);

      if (!user) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'User not found',
        });
      }

      return user;
    } catch (error) {
      if (isUniqueViolation(error)) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'A user with this email already exists',
        });
      }

      throw error;
    }
  }

  @Mutation({ input: deleteUserSchema, output: userSchema })
  async deleteUser(@Input() input: DeleteUserDto) {
    const user = await this.usersService.delete(input.id);

    if (!user) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'User not found',
      });
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

function isUniqueViolation(error: unknown) {
  return typeof error === 'object' && error !== null && 'code' in error && error.code === '23505';
}
