import { Module } from '@nestjs/common';

import { DatabaseModule } from '../database/database.module';
import { EventsModule } from '../events/events.module';
import { UsersEvents } from './users.events';
import { UsersService } from './users.service';

@Module({
  imports: [DatabaseModule, EventsModule],
  providers: [UsersEvents, UsersService],
  exports: [UsersEvents, UsersService],
})
export class UsersModule {}
