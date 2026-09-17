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
 */
export function ChatWidget() {
  const { session } = useRouteContext({ from: '__root__' });
  const [open, setOpen] = useState(false);

  if (!session) return null;

  return (
    <div className="fixed right-4 bottom-4 z-50 flex flex-col items-end gap-2">
      {open && <ChatPanel />}
      <Button size="sm" onClick={() => setOpen((current) => !current)}>
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
    <div className="bg-background flex h-96 w-80 flex-col rounded-lg border shadow-lg">
      <div className="flex items-center justify-between border-b px-3 py-2 text-sm font-medium">
        <span>Chat</span>
        <span className="text-muted-foreground text-xs">
          {connected ? 'online' : 'connecting…'}
        </span>
      </div>
      <ul className="flex-1 space-y-1 overflow-y-auto px-3 py-2 text-sm">
        {messages.map((message) => (
          <li key={`${message.from}-${message.at}`}>
            <span className="font-medium">{message.fromName}</span>{' '}
            <span className="text-muted-foreground">{message.text}</span>
          </li>
        ))}
      </ul>
      <form onSubmit={submit} className="flex gap-2 border-t p-2">
        <Input
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="Say something"
          maxLength={500}
        />
        <Button type="submit" size="sm" disabled={send.isPending}>
          Send
        </Button>
      </form>
    </div>
  );
}
