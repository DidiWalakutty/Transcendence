import { DynamicModule, Module } from '@nestjs/common';

import { DatabaseModule } from '../database/database.module';
import { DrizzleFriendsRepository } from './repositories/drizzle-friends.repository';
import { InMemoryFriendsRepository } from './repositories/in-memory-friends.repository';
import { FriendsRepository } from './repositories/friends.repository';
import { FriendsRouter } from './friends.router';
import { FriendsService } from './friends.service';

export type FriendsPersistence = 'database' | 'fixtures';

export interface FriendsModuleOptions {
  persistence: FriendsPersistence;
}

@Module({})
export class FriendsModule {
  static register(options: FriendsModuleOptions): DynamicModule {
    const { persistence } = options;
    const repository =
      persistence === 'fixtures' ? InMemoryFriendsRepository : DrizzleFriendsRepository;

    return {
      module: FriendsModule,
      imports: persistence === 'database' ? [DatabaseModule] : [],
      providers: [
        FriendsRouter,
        FriendsService,
        {
          provide: FriendsRepository,
          useClass: repository,
        },
      ],
    };
  }
}
