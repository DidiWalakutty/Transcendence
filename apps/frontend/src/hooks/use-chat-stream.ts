import { useState } from 'react';
import { useSubscription } from '@trpc/tanstack-react-query';
import type { ChatMessage } from '@repo/schemas/chat';
import { useTRPC } from '@/integrations/trpc/react';

const MAX_MESSAGES = 200;

export function useChatStream() {
  const trpc = useTRPC();

  //useState  <ChatMessage[]>  ([])
  //  ↑            ↑            ↑
  // function   type argument  value argument
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const subscription = useSubscription(
    trpc.chat.onMessage.subscriptionOptions(undefined, {
      onData: (message: ChatMessage) => {
        setMessages((current) => [...current, message].slice(-MAX_MESSAGES));
      },
    }),
  );
  return {
    messages,
    connected: subscription.status === 'pending',
  };
}
