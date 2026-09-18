import { z } from 'zod';
import { subscriptionSchema } from '@repo/schemas/subscription';

export const CHAT_MAX_LENGTH = 500;
export const CHAT_MAX_MESSAGES = 200;

export const chatMessageSchema = z.object({
  from: z.string(),
  fromName: z.string(),
  text: z.string().min(1).max(CHAT_MAX_LENGTH),
  at: z.string(),
});

export const sendChatMessageSchema = chatMessageSchema.pick({ text: true });

export type ChatMessage = z.infer<typeof chatMessageSchema>;
export type SendChatMessageDto = z.infer<typeof sendChatMessageSchema>;

export const chatMessagesSubscriptionSchema = subscriptionSchema<ChatMessage>();
