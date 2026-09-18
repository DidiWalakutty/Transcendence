import { Router, Mutation, Subscription, Input, Options, Ctx, UseMiddlewares } from 'nestjs-trpc';

import {
  chatMessageSchema,
  chatMessagesSubscriptionSchema,
  sendChatMessageSchema,
  type ChatMessage,
  type SendChatMessageDto,
} from '@repo/schemas/chat';
import { ProtectedMiddleware } from '../auth/protected.middleware';
import { ChatEvents } from './chat.events';

@Router({ alias: 'chat' })
export class ChatRouter {
  constructor(private readonly chatEvents: ChatEvents) {}

  @UseMiddlewares(ProtectedMiddleware)
  @Mutation({ input: sendChatMessageSchema, output: chatMessageSchema })
  send(
    @Input() input: SendChatMessageDto,
    @Ctx() ctx: { user: { id: string; name: string } },
  ): ChatMessage {
    const message: ChatMessage = {
      from: ctx.user.id,
      fromName: ctx.user.name,
      text: input.text,
      at: new Date().toISOString(),
    };
    this.chatEvents.emitMessage(message);
    return message;
  }

  @UseMiddlewares(ProtectedMiddleware)
  @Subscription({ output: chatMessagesSubscriptionSchema })
  async *onMessage(
    @Options() opts: { signal?: AbortSignal },
  ): AsyncGenerator<ChatMessage, void, void> {
    for await (const message of this.chatEvents.listenMessages(opts.signal)) {
      yield message;
    }
  }
}
