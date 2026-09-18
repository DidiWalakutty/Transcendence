import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import type { Cache } from 'cache-manager';
import type {
  AdminUpdateUserDto,
  CreateUserDto,
  UpdateUserDto,
  UserDto,
} from '@repo/schemas/users';
import { resolveUserDisplayName, resolveUserLocale } from '@repo/schemas/users';

import { UsersRepository } from './repositories/users.repository';
import { UsersEvents } from './users.events';
import { NotificationService } from '../notification/notification.service';

const USERS_CACHE_KEY = 'users:all';
@Injectable()
export class UsersService {
  constructor(
    private readonly repository: UsersRepository,
    @Inject(CACHE_MANAGER)
    private readonly cache: Cache,
    private readonly usersEvents: UsersEvents,
    private readonly notificationService: NotificationService,
  ) {}

  async findByEmail(email: string) {
    return this.repository.findByEmail(email);
  }

  async findById(id: string) {
    return this.repository.findById(id);
  }

  async findAll() {
    const cachedUsers = await this.cache.get<UserDto[]>(USERS_CACHE_KEY);

    if (cachedUsers) {
      return cachedUsers;
    }

    const allUsers = await this.repository.findAll();

    await this.cache.set(USERS_CACHE_KEY, allUsers);

    return allUsers;
  }

  async searchUsers(query?: string) {
    const all = await this.findAll();
    const q = query?.trim().toLowerCase();
    if (!q) return all;
    return all.filter((user) =>
      [user.name, user.username, user.email].some((v) => v.toLowerCase().includes(q)),
    );
  }

  async create(data: CreateUserDto) {
    const user = await this.repository.create(data);

    await this.afterUserMutation(user, 'created');

    try {
      const userLang = resolveUserLocale((user as { preferedLanguage?: unknown }).preferedLanguage);
      const userName = resolveUserDisplayName(user);

      this.notificationService
        .sendWelcomeEmail(user.email, userName, userLang)
        .catch((err) => console.error('Welcome mail failure:', err));
    } catch (mailError) {
      console.error('Background welcome notification failure:', mailError);
    }

    return user;
  }

  async update({ id, ...data }: UpdateUserDto | AdminUpdateUserDto) {
    const user = await this.repository.update({ id, ...data });

    if (user) {
      await this.afterUserMutation(user, 'updated');
    }

    return user;
  }

  async delete(id: string) {
    const user = await this.repository.delete(id);

    if (user) {
      await this.afterUserMutation(user, 'deleted');
    }

    return user;
  }

  private async afterUserMutation(user: UserDto, event: 'created' | 'updated' | 'deleted') {
    // Cache failure must not keep a successful database mutation pending.
    void this.clearUsersCache().catch((error: unknown) => {
      console.error('Could not invalidate the users cache:', error);
    });
    if (event === 'created') this.usersEvents.emitUserCreated(user);
    else if (event === 'updated') this.usersEvents.emitUserUpdated(user);
    else this.usersEvents.emitUserDeleted(user);
  }

  private async clearUsersCache() {
    await this.cache.del(USERS_CACHE_KEY);
  }
}
