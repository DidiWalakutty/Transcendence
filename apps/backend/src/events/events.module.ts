// Sets up everything related to events in the backend.
// Connects the Events router, service, and databaserepository together,
// so a create-event request can travel from the API endpoint to the database and back.

import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { EventsRouter } from './events.router';
import { EventsService } from './events.service';
import { EventsRepository } from './repositories/events.repository';
import { DrizzleEventsRepository } from './repositories/drizzle-events.repository';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [DatabaseModule, AuthModule],
  providers: [
    EventsRouter,
    EventsService,
    {
      provide: EventsRepository,
      useClass: DrizzleEventsRepository,
    },
  ],
  exports: [EventsService],
})
export class EventsModule {}
