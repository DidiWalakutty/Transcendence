import { describe, expect, it, vi } from 'vitest';

import { UserEmailAlreadyExistsError } from './errors/user-email-already-exists.error';
import { UsersEvents } from './users.events';
import { UsersRouter } from './users.router';
import { UsersService } from './users.service';

describe('UsersRouter', () => {
  it('maps duplicate email domain errors to a conflict response', async () => {
    const usersService = {
      create: vi.fn().mockRejectedValue(new UserEmailAlreadyExistsError()),
    } as unknown as UsersService;
    const router = new UsersRouter({} as UsersEvents, usersService);

    await expect(
      router.createUser({
        name: 'Ada Lovelace',
        email: 'ada@example.com',
      }),
    ).rejects.toMatchObject({
      code: 'CONFLICT',
    });
  });

  it('maps missing users to a not-found response', async () => {
    const usersService = {
      delete: vi.fn().mockResolvedValue(undefined),
    } as unknown as UsersService;
    const router = new UsersRouter({} as UsersEvents, usersService);

    await expect(
      router.deleteUser({
        id: '2de0f53e-a6a2-4aaf-a47d-0ecaafde7748',
      }),
    ).rejects.toMatchObject({
      code: 'NOT_FOUND',
    });
  });
});
