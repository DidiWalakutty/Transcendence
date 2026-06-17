import { Inject, Injectable } from '@nestjs/common';
import { asc, eq } from 'drizzle-orm';
import { users, type CreateUser } from '@repo/schemas/database';
import type { UpdateUserDto } from '@repo/schemas/users';

import { DATABASE } from '../database/database.constants';
import type { Database } from '../database/database.types';
import { UsersEvents } from './users.events';

@Injectable()
export class UsersService {
  constructor(
    @Inject(DATABASE)
    private readonly db: Database,
    private readonly usersEvents: UsersEvents,
  ) {}

  async findByEmail(email: string) {
    return this.db.query.users.findFirst({
      where: eq(users.email, email),
    });
  }

  async findAll() {
    return this.db.query.users.findMany({
      orderBy: asc(users.createdAt),
    });
  }

  async create(data: CreateUser) {
    const [user] = await this.db.insert(users).values(data).returning();

    this.usersEvents.emitUserCreated(user);

    return user;
  }

  async update({ id, ...data }: UpdateUserDto) {
    const [user] = await this.db.update(users).set(data).where(eq(users.id, id)).returning();

    if (user) {
      this.usersEvents.emitUserUpdated(user);
    }

    return user;
  }

  async delete(id: string) {
    const [user] = await this.db.delete(users).where(eq(users.id, id)).returning();

    if (user) {
      this.usersEvents.emitUserDeleted(user);
    }

    return user;
  }
}
