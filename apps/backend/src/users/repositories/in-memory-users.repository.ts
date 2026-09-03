import { randomUUID } from 'node:crypto';
import { Injectable } from '@nestjs/common';
import type {
  AdminUpdateUserDto,
  CreateUserDto,
  UpdateUserDto,
  UserDto,
} from '@repo/schemas/users';

import { createUserFixtures } from '../fixtures/users.fixture';
import { UserEmailAlreadyExistsError } from '../errors/user-email-already-exists.error';
import { UsersRepository } from './users.repository';

@Injectable()
export class InMemoryUsersRepository extends UsersRepository {
  private readonly users = createUserFixtures();

  async findByEmail(email: string) {
    return this.users.find((user) => user.email === email);
  }

  async findAll() {
    return [...this.users].sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }

  async findById(id: string) {
    return this.users.find((u) => u.id === id);
  }

  async create(data: CreateUserDto) {
    this.assertUniqueEmail(data.email);

    const user: UserDto = {
      role: 'user',
      banned: false,
      banReason: null,
      banExpires: null,
      aboutMe: null,
      location: null,
      preferedLanguage: 'english',
      avatar: 'PLACEHOLDER',
      displayUsername: null,
      emailVerified: false,
      twoFactorEnabled: false,
      ...data,
      id: randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.users.push(user);

    return user;
  }

  async update({ id, ...data }: UpdateUserDto | AdminUpdateUserDto) {
    const index = this.users.findIndex((user) => user.id === id);

    if (index === -1) {
      return undefined;
    }

    if (data.email) {
      this.assertUniqueEmail(data.email, id);
    }

    const user: UserDto = {
      ...this.users[index],
      ...data,
    };

    this.users[index] = user;

    return user;
  }

  async delete(id: string) {
    const index = this.users.findIndex((user) => user.id === id);

    if (index === -1) {
      return undefined;
    }

    const [user] = this.users.splice(index, 1);

    return user;
  }

  private assertUniqueEmail(email: string, ignoredUserId?: string) {
    const duplicate = this.users.some((user) => user.email === email && user.id !== ignoredUserId);

    if (duplicate) {
      throw new UserEmailAlreadyExistsError();
    }
  }
}
