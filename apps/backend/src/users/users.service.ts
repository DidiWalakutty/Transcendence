import { Inject, Injectable } from '@nestjs/common';
import { asc, eq } from 'drizzle-orm';
import { users, type CreateUser } from '@repo/schemas/database';

import { DATABASE } from '../database/database.constants';
import type { Database } from '../database/database.types';

@Injectable()
export class UsersService {
  constructor(
    @Inject(DATABASE)
    private readonly db: Database,
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

    return user;
  }
}
