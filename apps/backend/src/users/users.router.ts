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

import {
  adminUpdateUserSchema,
  createUserSchema,
  deleteUserSchema,
  userCreatedSubscriptionSchema,
  userDeletedSubscriptionSchema,
  userUpdatedSubscriptionSchema,
  userSchema,
  updateUserSchema,
  type AdminUpdateUserDto,
  type CreateUserDto,
  type DeleteUserDto,
  type UpdateUserDto,
  type UserDto,
} from '@repo/schemas/users';
import { AdminMiddleware } from '../auth/admin.middleware';
import { ProtectedMiddleware } from '../auth/protected.middleware';
import { conflictError, forbiddenError, notFoundError } from '../trpc/trpc.errors';
import { UserEmailAlreadyExistsError } from './errors/user-email-already-exists.error';
import { UsersEvents } from './users.events';
import { UsersService } from './users.service';

async function updateUserOrThrow(
  usersService: UsersService,
  input: UpdateUserDto | AdminUpdateUserDto,
) {
  try {
    const user = await usersService.update(input);

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

@Router({ alias: 'users' })
export class UsersRouter {
  constructor(
    private readonly usersEvents: UsersEvents,
    private readonly usersService: UsersService,
  ) {}

  @UseMiddlewares(AdminMiddleware)
  @Mutation({ input: createUserSchema, output: userSchema })
  async createUser(@Input() input: CreateUserDto) {
    try {
      return await this.usersService.create(input);
    } catch (error) {
      if (error instanceof UserEmailAlreadyExistsError) {
        throw conflictError(error.message);
      }

      throw error;
    }
  }

  @UseMiddlewares(ProtectedMiddleware)
  @Query({ output: userSchema.array() })
  async getUsers() {
    return this.usersService.findAll();
  }

  @Query({ output: userSchema.nullable() })
  async getMe(@Ctx() ctx: { user: { id: string } | null }) {
    if (!ctx.user) return null;
    return (await this.usersService.findById(ctx.user.id)) ?? null;
  }

  @UseMiddlewares(ProtectedMiddleware)
  @Mutation({ input: updateUserSchema, output: userSchema })
  async updateUser(
    @Input() input: UpdateUserDto,
    @Ctx()
    ctx: { user: { id: string; role?: string | null } },
  ) {
    const hasAdminRole = ctx.user.role?.split(',').includes('admin');
    if (!hasAdminRole && ctx.user.id !== input.id) {
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

    if (!user) {
      throw notFoundError('User not found');
    }

    return user;
  }

  @UseMiddlewares(AdminMiddleware)
  @Subscription({ output: userCreatedSubscriptionSchema })
  async *onUserCreated(
    @Options() opts: { signal?: AbortSignal },
  ): AsyncGenerator<UserDto, void, void> {
    for await (const user of this.usersEvents.listenUserCreated(opts.signal)) {
      yield user;
    }
  }

  @UseMiddlewares(AdminMiddleware)
  @Subscription({ output: userUpdatedSubscriptionSchema })
  async *onUserUpdated(
    @Options() opts: { signal?: AbortSignal },
  ): AsyncGenerator<UserDto, void, void> {
    for await (const user of this.usersEvents.listenUserUpdated(opts.signal)) {
      yield user;
    }
  }

  @UseMiddlewares(AdminMiddleware)
  @Subscription({ output: userDeletedSubscriptionSchema })
  async *onUserDeleted(
    @Options() opts: { signal?: AbortSignal },
  ): AsyncGenerator<UserDto, void, void> {
    for await (const user of this.usersEvents.listenUserDeleted(opts.signal)) {
      yield user;
    }
  }
}
