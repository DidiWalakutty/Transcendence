import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useRouteContext } from '@tanstack/react-router';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useChatStream } from '@/hooks/use-chat-stream';
import { useTRPC } from '@/integrations/trpc/react';

/**
 * Global chat room, fixed bottom-right. Renders nothing for visitors: the
 * stream is only opened by ChatPanel, which mounts once there is a session.
 * Hiding the panel keeps it mounted so history and the stream survive.
 */
export function ChatWidget() {
  const { session } = useRouteContext({ from: '__root__' });
  const [open, setOpen] = useState(false);

  if (!session) return null;

  return (
    <div className="fixed right-4 bottom-4 z-50 flex flex-col items-end gap-3">
      <div className={open ? 'contents' : 'hidden'}>
        <ChatPanel />
      </div>
      {/* Toggle button, smaller below `md`: the `size` prop cannot change
          with the viewport, so the phone sizes are given as classes. */}
      <Button
        size="lg"
        className="h-9 px-4 text-sm md:h-12 md:px-6 md:text-base"
        onClick={() => setOpen((current) => !current)}
      >
        {open ? 'Hide chat' : 'Chat'}
      </Button>
    </div>
  );
}

function ChatPanel() {
  const trpc = useTRPC();
  const { messages, connected } = useChatStream();
  const [text, setText] = useState('');

  const send = useMutation(
    trpc.chat.send.mutationOptions({
      onSuccess: () => setText(''),
    }),
  );

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;
    send.mutate({ text: trimmed });
  };

  return (
    <div className="bg-background flex h-[60vh] max-h-[32rem] w-[calc(100vw-2rem)] max-w-96 flex-col rounded-lg border text-sm shadow-lg md:text-base">
      <div className="flex items-center justify-between border-b px-4 py-3 font-medium">
        <span>Chat</span>
        <span className="text-muted-foreground text-xs md:text-sm">
          {connected ? 'online' : 'connecting…'}
        </span>
      </div>
      <ul className="flex-1 space-y-2 overflow-y-auto px-4 py-3">
        {messages.map((message) => (
          <li key={`${message.from}-${message.at}`}>
            <span className="font-medium">{message.fromName}</span>{' '}
            <span className="text-muted-foreground">{message.text}</span>
          </li>
        ))}
      </ul>
      <form onSubmit={submit} className="flex gap-3 border-t p-3">
        <Input
          className="h-9 text-sm md:h-12 md:text-base"
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="Say something"
          maxLength={500}
        />
        <Button
          type="submit"
          size="lg"
          className="h-9 px-4 text-sm md:h-12 md:px-6 md:text-base"
          disabled={send.isPending}
        >
          Send
        </Button>
      </form>
    </div>
  );
}
