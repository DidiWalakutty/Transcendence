import { cn } from '@/lib/utils';

export function StatusDot({
  state,
  online,
  className,
}: {
  state?: 'online' | 'offline' | 'connected' | 'reconnecting' | 'failed';
  online?: boolean;
  className?: string;
}) {
  const resolved = state ?? (online ? 'online' : 'offline');
  return (
    <span
      aria-hidden="true"
      className={cn(
        'inline-block size-2 rounded-full',
        resolved === 'online' || resolved === 'connected'
          ? 'bg-green-500'
          : resolved === 'failed'
            ? 'bg-destructive'
            : 'bg-muted-foreground',
        className,
      )}
    />
  );
}
