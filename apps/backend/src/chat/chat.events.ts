import { Injectable } from '@nestjs/common';
import type { ChatMessage } from '@repo/schemas/chat';

import { EventsService } from '../events/events.service';

const CHAT_MESSAGE_EVENT = 'chat.message';

@Injectable()
export class ChatEvents {
  constructor(private readonly eventsService: EventsService) {}

  emitMessage(message: ChatMessage) {
    return this.eventsService.emit(CHAT_MESSAGE_EVENT, message);
  }

  listenMessages(signal?: AbortSignal) {
    return this.eventsService.listen<ChatMessage>(CHAT_MESSAGE_EVENT, signal);
  }
}
