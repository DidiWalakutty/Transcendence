import { Module } from '@nestjs/common';

import { EventsModule } from '../events/events.module';
import { PresenceEvents } from './presence.events';
import { PresenceRouter } from './presence.router';
import { PresenceService } from './presence.service';

@Module({
  imports: [EventsModule],
  providers: [PresenceService, PresenceEvents, PresenceRouter],
})
export class PresenceModule {}
