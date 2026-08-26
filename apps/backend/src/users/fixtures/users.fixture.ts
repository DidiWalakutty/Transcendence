import type { UserDto } from '@repo/schemas/users';

const users: UserDto[] = [
  {
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
    displayUsername: null,
    emailVerified: false,
    updatedAt: new Date('2026-01-12T09:00:00.000Z'),
    twoFactorEnabled: false,
  },
  {
    id: '64de8cd7-e120-4ad1-b849-4b386f31d599',
    name: 'Grace Hopper',
    email: 'grace@example.com',
    createdAt: new Date('2026-02-18T14:30:00.000Z'),
    isAdministrator: false,
    aboutMe: null,
    location: null,
    preferedLanguage: 'english',
    avatar: 'PLACEHOLDER',
    username: 'grace_hopper',
    displayUsername: null,
    emailVerified: false,
    updatedAt: new Date('2026-02-18T14:30:00.000Z'),
    twoFactorEnabled: false,
  },
  {
    id: 'a5265f78-6e91-4e82-bc39-86e8ec9cd6ca',
    name: 'Alan Turing',
    email: 'alan@example.com',
    createdAt: new Date('2026-03-24T11:15:00.000Z'),
    isAdministrator: false,
    aboutMe: null,
    location: null,
    preferedLanguage: 'english',
    avatar: 'PLACEHOLDER',
    username: 'alan_turing',
    displayUsername: null,
    emailVerified: false,
    updatedAt: new Date('2026-03-24T11:15:00.000Z'),
    twoFactorEnabled: false,
  },
];

export const createUserFixtures = () =>
  users.map((user) => ({
    ...user,
    createdAt: new Date(user.createdAt),
  }));
