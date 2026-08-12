import { DynamicModule, Module } from '@nestjs/common';

import { DatabaseModule } from '../database/database.module';
import { DrizzleEventListingsRepository } from './repositories/drizzle-event-listings.repository';
import { EventListingsRepository } from './repositories/event-listings.repository';
import { InMemoryEventListingsRepository } from './repositories/in-memory-event-listings.repository';
import { EventListingsRouter } from './event-listings.router';
import { EventListingsService } from './event-listings.service';

export type EventListingsPersistence = 'database' | 'fixtures';

export interface EventListingsModuleOptions {
  persistence: EventListingsPersistence;
}

@Module({})
export class EventListingsModule {
  static register(options: EventListingsModuleOptions): DynamicModule {
    const { persistence } = options;
    const repository =
      persistence === 'fixtures' ? InMemoryEventListingsRepository : DrizzleEventListingsRepository;

    return {
      module: EventListingsModule,
      imports: [...(persistence === 'database' ? [DatabaseModule] : [])],
      providers: [
        EventListingsRouter,
        EventListingsService,
        {
          provide: EventListingsRepository,
          useClass: repository,
        },
      ],
    };
  }
}
