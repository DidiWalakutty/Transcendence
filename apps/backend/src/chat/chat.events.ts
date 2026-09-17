import { Injectable } from '@nestjs/common';
import type { ChatMessage } from '@repo/schemas/chat';

import { EventsService } from '../events/events.service';

const CHAT_MESSAGE_EVENT = 'chat.message';

@Injectable()
export class ChatEvents {
  constructor(private readonly EventsService: EventsService) {}

  emitMessage(message: ChatMessage) {
    return this.EventsService.emit(CHAT_MESSAGE_EVENT, message);
  }

  listenMessage(signal?: AbortSignal) {
    return this.EventsService.listen<ChatMessage>(CHAT_MESSAGE_EVENT, signal);
  }
}
