import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { EventsRouter } from './events.router';
import { EventsService } from './events.service';
import { EventsRepository } from './repositories/events.repository';
import { DrizzleEventsRepository } from './repositories/drizzle-events.repository';

// Registers everything needed for event creation and handling in the backend.
// The module connects the EventsRouter, EventsService and database repository
// so a create-event request can travel from the API endpoint to the database and back.

@Module({
  imports: [DatabaseModule],
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
