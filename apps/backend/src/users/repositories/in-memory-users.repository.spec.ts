import { describe, expect, it } from 'vitest';

import { UserEmailAlreadyExistsError } from '../errors/user-email-already-exists.error';
import { InMemoryUsersRepository } from './in-memory-users.repository';

describe('InMemoryUsersRepository', () => {
  it('starts with independent fixture data', async () => {
    const first = new InMemoryUsersRepository();
    const second = new InMemoryUsersRepository();

    const deleted = await first.delete('2de0f53e-a6a2-4aaf-a47d-0ecaafde7748');

    expect(deleted?.email).toBe('ada@example.com');
    await expect(first.findAll()).resolves.toHaveLength(2);
    await expect(second.findAll()).resolves.toHaveLength(3);
  });

  it('supports create, update, and delete', async () => {
    const repository = new InMemoryUsersRepository();
    const created = await repository.create({
      name: 'Fixture User',
      email: 'fixture@example.com',
      username: 'ada_lovelace',
    });

    await expect(
      repository.update({
        id: created.id,
        name: 'Updated Fixture',
        email: 'updated@example.com',
        username: 'ada_lovelace',
      }),
    ).resolves.toMatchObject({
      id: created.id,
      name: 'Updated Fixture',
      email: 'updated@example.com',
    });
    await expect(repository.delete(created.id)).resolves.toMatchObject({
      id: created.id,
    });
    await expect(repository.delete(created.id)).resolves.toBeUndefined();
  });

  it('throws a domain error for duplicate emails', async () => {
    const repository = new InMemoryUsersRepository();

    await expect(
      repository.create({
        name: 'Duplicate User',
        email: 'ada@example.com',
        username: 'ada_lovelace',
      }),
    ).rejects.toBeInstanceOf(UserEmailAlreadyExistsError);
  });
});
