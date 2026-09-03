import { Inject, Injectable } from '@nestjs/common';
import { asc, eq } from 'drizzle-orm';
import { users } from '@repo/schemas/database';
import type { AdminUpdateUserDto, CreateUserDto, UpdateUserDto } from '@repo/schemas/users';

import { DATABASE } from '../../database/database.constants';
import { isUniqueViolation } from '../../database/database.errors';
import type { Database } from '../../database/database.types';
import { UserEmailAlreadyExistsError } from '../errors/user-email-already-exists.error';
import { UsersRepository } from './users.repository';

@Injectable()
export class DrizzleUsersRepository extends UsersRepository {
  constructor(
    @Inject(DATABASE)
    private readonly db: Database,
  ) {
    super();
  }

  async findByEmail(email: string) {
    return this.db.query.users.findFirst({
      where: eq(users.email, email),
    });
  }

  async findById(id: string) {
    return this.db.query.users.findFirst({
      where: eq(users.id, id),
    });
  }

  async findAll() {
    return this.db.query.users.findMany({
      orderBy: asc(users.createdAt),
    });
  }

  async create(data: CreateUserDto) {
    try {
      const [user] = await this.db.insert(users).values(data).returning();

      return user;
    } catch (error) {
      this.rethrowKnownError(error);
    }
  }

  async update({ id, ...data }: UpdateUserDto | AdminUpdateUserDto) {
    try {
      const [user] = await this.db.update(users).set(data).where(eq(users.id, id)).returning();

      return user;
    } catch (error) {
      this.rethrowKnownError(error);
    }
  }

  async delete(id: string) {
    const [user] = await this.db.delete(users).where(eq(users.id, id)).returning();

    return user;
  }

  private rethrowKnownError(error: unknown): never {
    if (isUniqueViolation(error)) {
      throw new UserEmailAlreadyExistsError();
    }

    throw error;
  }
}
