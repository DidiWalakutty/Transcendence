import type { Cache } from 'cache-manager';
import type { UserDto } from '@repo/schemas/users';
import { beforeEach, describe, expect, it, vi, type Mock } from 'vitest';

import { UsersRepository } from './repositories/users.repository';
import { UsersEvents } from './users.events';
import { UsersService } from './users.service';

const user: UserDto = {
  id: '2de0f53e-a6a2-4aaf-a47d-0ecaafde7748',
  name: 'Ada Lovelace',
  email: 'ada@example.com',
  createdAt: new Date('2026-01-12T09:00:00.000Z'),
  isAdministrator: false,
  aboutMe: null,
  location: null,
  preferedLanguage: 'english',
  avatar: 'PLACEHOLDER',
  username: 'ada_lovelace',
};

describe('UsersService', () => {
  let repository: UsersRepository;
  let cache: Cache;
  let events: UsersEvents;
  let service: UsersService;
  let findAll: Mock<UsersRepository['findAll']>;
  let update: Mock<UsersRepository['update']>;
  let deleteUser: Mock<UsersRepository['delete']>;
  let emitUserCreated: ReturnType<typeof vi.fn>;
  let emitUserUpdated: ReturnType<typeof vi.fn>;
  let emitUserDeleted: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    findAll = vi.fn<UsersRepository['findAll']>().mockResolvedValue([user]);
    update = vi.fn<UsersRepository['update']>().mockResolvedValue(user);
    deleteUser = vi.fn<UsersRepository['delete']>().mockResolvedValue(user);
    emitUserCreated = vi.fn();
    emitUserUpdated = vi.fn();
    emitUserDeleted = vi.fn();
    repository = {
      findByEmail: vi.fn(),
      findAll,
      create: vi.fn().mockResolvedValue(user),
      update,
      delete: deleteUser,
    };
    cache = {
      get: vi.fn(),
      set: vi.fn(),
      del: vi.fn(),
    } as unknown as Cache;
    events = {
      emitUserCreated,
      emitUserUpdated,
      emitUserDeleted,
    } as unknown as UsersEvents;
    service = new UsersService(repository, cache, events);
  });

  it('uses and populates the configured cache', async () => {
    await expect(service.findAll()).resolves.toEqual([user]);
    expect(findAll).toHaveBeenCalledOnce();
    expect(cache.set).toHaveBeenCalledWith('users:all', [user]);

    vi.mocked(cache.get).mockResolvedValue([user]);
    await service.findAll();

    expect(findAll).toHaveBeenCalledOnce();
  });

  it('invalidates cache and emits events after mutations', async () => {
    await service.create({
      name: user.name,
      email: user.email,
      username: user.username,
    });
    await service.update({
      id: user.id,
      name: user.name,
      email: user.email,
      username: user.username,
    });
    await service.delete(user.id);

    expect(cache.del).toHaveBeenCalledTimes(3);
    expect(emitUserCreated).toHaveBeenCalledWith(user);
    expect(emitUserUpdated).toHaveBeenCalledWith(user);
    expect(emitUserDeleted).toHaveBeenCalledWith(user);
  });

  it('does not invalidate cache or emit when a mutation finds no user', async () => {
    update.mockResolvedValue(undefined);
    deleteUser.mockResolvedValue(undefined);

    await service.update({
      id: user.id,
      name: user.name,
      email: user.email,
      username: user.username,
    });
    await service.delete(user.id);

    expect(cache.del).not.toHaveBeenCalled();
    expect(emitUserUpdated).not.toHaveBeenCalled();
    expect(emitUserDeleted).not.toHaveBeenCalled();
  });
});
