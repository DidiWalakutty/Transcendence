import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import type { Cache } from 'cache-manager';
import type { CreateUserDto, UpdateUserDto, UserDto } from '@repo/schemas/users';

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

  async create(data: CreateUserDto) {
    const user = await this.repository.create(data);

    await this.clearUsersCache();
    this.usersEvents.emitUserCreated(user);

    try {
      const dbLang = (user as any).preferedLanguage;
      const userLang = ['nl', 'es', 'ru'].includes(dbLang)
        ? (dbLang as 'en' | 'nl' | 'es' | 'ru')
        : 'en';

      this.notificationService
        .sendWelcomeEmail(user.email, user.name, userLang)
        .catch((err) => console.error('Welcome mail failure:', err));
    } catch (mailError) {
      console.error('Background welcome notification failure:', mailError);
    }

    return user;
  }

  async update({ id, ...data }: UpdateUserDto) {
    const user = await this.repository.update({ id, ...data });

    if (user) {
      await this.clearUsersCache();
      this.usersEvents.emitUserUpdated(user);
    }

    return user;
  }

  async delete(id: string) {
    const user = await this.repository.delete(id);

    if (user) {
      await this.clearUsersCache();
      this.usersEvents.emitUserDeleted(user);
    }

    return user;
  }

  private async clearUsersCache() {
    await this.cache.del(USERS_CACHE_KEY);
  }
}
