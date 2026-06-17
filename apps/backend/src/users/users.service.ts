import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { asc, eq } from 'drizzle-orm';
import { users, type CreateUser } from '@repo/schemas/database';
import type { Cache } from 'cache-manager';
import type { UpdateUserDto, UserDto } from '@repo/schemas/users';

import { DATABASE } from '../database/database.constants';
import type { Database } from '../database/database.types';
import { UsersEvents } from './users.events';

const USERS_CACHE_KEY = 'users:all';
const USERS_CACHE_TTL_MS = 30_000;

@Injectable()
export class UsersService {
  constructor(
    @Inject(DATABASE)
    private readonly db: Database,
    @Inject(CACHE_MANAGER)
    private readonly cache: Cache,
    private readonly usersEvents: UsersEvents,
  ) {}

  async findByEmail(email: string) {
    return this.db.query.users.findFirst({
      where: eq(users.email, email),
    });
  }

  async findAll() {
    const cachedUsers = await this.cache.get<UserDto[]>(USERS_CACHE_KEY);

    if (cachedUsers) {
      return cachedUsers;
    }

    const allUsers = await this.db.query.users.findMany({
      orderBy: asc(users.createdAt),
    });

    await this.cache.set(USERS_CACHE_KEY, allUsers, USERS_CACHE_TTL_MS);

    return allUsers;
  }

  async create(data: CreateUser) {
    const [user] = await this.db.insert(users).values(data).returning();

    await this.clearUsersCache();
    await this.usersEvents.emitUserCreated(user);

    return user;
  }

  async update({ id, ...data }: UpdateUserDto) {
    const [user] = await this.db.update(users).set(data).where(eq(users.id, id)).returning();

    if (user) {
      await this.clearUsersCache();
      await this.usersEvents.emitUserUpdated(user);
    }

    return user;
  }

  async delete(id: string) {
    const [user] = await this.db.delete(users).where(eq(users.id, id)).returning();

    if (user) {
      await this.clearUsersCache();
      await this.usersEvents.emitUserDeleted(user);
    }

    return user;
  }

  private async clearUsersCache() {
    await this.cache.del(USERS_CACHE_KEY);
  }
}
