import { describe, expect, it, vi } from 'vitest';

import type { Database } from '../../database/database.types';
import { UserEmailAlreadyExistsError } from '../errors/user-email-already-exists.error';
import { DrizzleUsersRepository } from './drizzle-users.repository';

describe('DrizzleUsersRepository', () => {
  it('translates PostgreSQL uniqueness failures into a domain error', async () => {
    const returning = vi.fn().mockRejectedValue({
      code: '23505',
    });
    const database = {
      insert: vi.fn(() => ({
        values: vi.fn(() => ({
          returning,
        })),
      })),
    } as unknown as Database;
    const repository = new DrizzleUsersRepository(database);

    await expect(
      repository.create({
        name: 'Ada Lovelace',
        email: 'ada@example.com',
      }),
    ).rejects.toBeInstanceOf(UserEmailAlreadyExistsError);
  });

  it('does not hide unexpected database failures', async () => {
    const databaseError = new Error('Database unavailable');
    const returning = vi.fn().mockRejectedValue(databaseError);
    const database = {
      insert: vi.fn(() => ({
        values: vi.fn(() => ({
          returning,
        })),
      })),
    } as unknown as Database;
    const repository = new DrizzleUsersRepository(database);

    await expect(
      repository.create({
        name: 'Ada Lovelace',
        email: 'ada@example.com',
      }),
    ).rejects.toBe(databaseError);
  });
});
