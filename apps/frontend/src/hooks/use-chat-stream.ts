import { useState } from 'react';
import { useSubscription } from '@trpc/tanstack-react-query';
import { CHAT_MAX_MESSAGES, type ChatMessage } from '@repo/schemas/chat';
import { useTRPC } from '@/integrations/trpc/react';

export function useChatStream() {
  const trpc = useTRPC();

  //useState  <ChatMessage[]>  ([])
  //  ↑            ↑            ↑
  // function   type argument  value argument
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const subscription = useSubscription(
    trpc.chat.onMessage.subscriptionOptions(undefined, {
      onData: (message: ChatMessage) => {
        setMessages((current) => [...current, message].slice(-CHAT_MAX_MESSAGES));
      },
    }),
  );
  return {
    messages,
    connected: subscription.status === 'pending',
  };
}
