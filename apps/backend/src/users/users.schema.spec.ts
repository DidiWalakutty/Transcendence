import { describe, expect, it } from 'vitest';

import { userSchema } from '@repo/schemas/users';

describe('userSchema', () => {
  it('accepts date strings restored from the distributed cache', () => {
    const result = userSchema.parse({
      id: '783fb908-bc45-46e5-8f91-b7ccc309992d',
      email: 'admin@example.com',
      name: 'Admin',
      createdAt: '2026-09-03T10:00:00.000Z',
      updatedAt: '2026-09-03T10:01:00.000Z',
      role: 'admin',
      banned: false,
      banReason: null,
      banExpires: '2026-10-03T10:00:00.000Z',
      aboutMe: null,
      location: null,
      preferedLanguage: 'en',
      avatar: 'PLACEHOLDER',
      username: 'admin',
      displayUsername: null,
      emailVerified: true,
      twoFactorEnabled: false,
    });

    expect(result.createdAt).toBeInstanceOf(Date);
    expect(result.updatedAt).toBeInstanceOf(Date);
    expect(result.banExpires).toBeInstanceOf(Date);
  });

  it('accepts a null ban expiry from the cache', () => {
    const result = userSchema.parse({
      id: '783fb908-bc45-46e5-8f91-b7ccc309992d',
      email: 'admin@example.com',
      name: 'Admin',
      createdAt: '2026-09-03T10:00:00.000Z',
      updatedAt: '2026-09-03T10:01:00.000Z',
      role: 'admin',
      banned: false,
      banReason: null,
      banExpires: null,
      aboutMe: null,
      location: null,
      preferedLanguage: 'en',
      avatar: 'PLACEHOLDER',
      username: 'admin',
      displayUsername: null,
      emailVerified: true,
      twoFactorEnabled: false,
    });

    expect(result.banExpires).toBeNull();
  });
});
