import { Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module';
import { EventsModule } from '../events/events.module';
import { ChatEvents } from './chat.events';
import { ChatRouter } from './chat.router';

@Module({
  imports: [AuthModule, EventsModule],
  providers: [ChatEvents, ChatRouter],
})
export class ChatModule {}
