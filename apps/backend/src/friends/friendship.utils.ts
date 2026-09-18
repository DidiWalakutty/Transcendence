import { and, eq, or } from 'drizzle-orm';
import { friends } from '@repo/schemas/database';
import { isSamePair } from '@repo/schemas/friends';

export { isSamePair };

export function friendshipPairCondition(myId: string, friendId: string) {
  return or(
    and(eq(friends.myId, myId), eq(friends.friendId, friendId)),
    and(eq(friends.myId, friendId), eq(friends.friendId, myId)),
  );
}
