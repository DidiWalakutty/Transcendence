import { z } from 'zod';

export const chatMessageSchema = z.object({
  from: z.string(),
  fromName: z.string(),
  text: z.string().min(1).max(500),
  at: z.string(),
});

export type ChatMessage = z.infer<typeof chatMessageSchema>;
