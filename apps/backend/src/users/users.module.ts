import { DynamicModule, Module } from '@nestjs/common';

import { DatabaseModule } from '../database/database.module';
import { EventsModule } from '../events/events.module';
import { DrizzleUsersRepository } from './repositories/drizzle-users.repository';
import { InMemoryUsersRepository } from './repositories/in-memory-users.repository';
import { UsersRepository } from './repositories/users.repository';
import { UsersEvents } from './users.events';
import { UsersRouter } from './users.router';
import { UsersService } from './users.service';

export type UsersPersistence = 'database' | 'fixtures';

export interface UsersModuleOptions {
  persistence: UsersPersistence;
}

@Module({})
export class UsersModule {
  static register(options: UsersModuleOptions): DynamicModule {
    const { persistence } = options;
    const repository =
      persistence === 'fixtures' ? InMemoryUsersRepository : DrizzleUsersRepository;

    return {
      module: UsersModule,
      imports: [EventsModule, ...(persistence === 'database' ? [DatabaseModule] : [])],
      providers: [
        UsersEvents,
        UsersRouter,
        UsersService,
        {
          provide: UsersRepository,
          useClass: repository,
        },
      ],
    };
  }
}
