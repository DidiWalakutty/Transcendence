// One place that decides what a user's avatar looks like.
// The users.avatar column defaults to 'PLACEHOLDER' and is nullable, so both
// are treated as "no avatar uploaded" and fall back to the user's initials.

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { NO_AVATAR, avatarSource } from '@/lib/image';

export { NO_AVATAR, avatarSource };

export function avatarInitials(name?: string | null, username?: string | null): string {
  const source = name?.trim() || username?.trim() || '';
  const parts = source.split(/\s+/).filter(Boolean).slice(0, 2);

  if (parts.length === 0) {
    return '?';
  }

  return parts.map((part) => part.charAt(0).toUpperCase()).join('');
}

export function UserAvatar({
  name,
  username,
  avatar,
  className,
}: {
  name?: string | null;
  username?: string | null;
  avatar?: string | null;
  className?: string;
}) {
  const source = avatarSource(avatar);

  return (
    <Avatar className={cn('size-10', className)}>
      {source && <AvatarImage src={source} alt="" />}
      <AvatarFallback className="bg-primary font-bold text-white">
        {avatarInitials(name, username)}
      </AvatarFallback>
    </Avatar>
  );
}
