import { Inject, Injectable } from '@nestjs/common';
import { and, eq, or, notInArray, ilike } from 'drizzle-orm';
import { friends, users } from '@repo/schemas/database';
import { DATABASE } from '../../database/database.constants';
import type { Database } from '../../database/database.types';
import { FriendsRepository } from './friends.repository';
import { friendshipPairCondition } from '../friendship.utils';

@Injectable()
export class DrizzleFriendsRepository extends FriendsRepository {
  constructor(
    @Inject(DATABASE)
    private readonly db: Database,
  ) {
    super();
  }

  async findFriends(userId: string) {
    const rows = await this.db
      .select({ user: users })
      .from(friends)
      .innerJoin(
        users,
        or(
          and(eq(friends.myId, userId), eq(users.id, friends.friendId)),
          and(eq(friends.friendId, userId), eq(users.id, friends.myId)),
        ),
      )
      .where(eq(friends.status, 'accepted'));

    return rows.map((row) => row.user);
  }

  async findPendingRequests(userId: string) {
    const rows = await this.db
      .select({ user: users })
      .from(friends)
      .innerJoin(users, eq(users.id, friends.myId))
      .where(and(eq(friends.friendId, userId), eq(friends.status, 'pending')));

    return rows.map((row) => row.user);
  }

  async addFriend(myId: string, friendId: string) {
    const [friendship] = await this.db
      .insert(friends)
      .values({ myId, friendId, status: 'pending' })
      .returning();

    return friendship;
  }

  async findFriendship(myId: string, friendId: string) {
    return this.db.query.friends.findFirst({
      where: friendshipPairCondition(myId, friendId),
    });
  }
  async acceptFriend(myId: string, friendId: string) {
    const [friendship] = await this.db
      .update(friends)
      .set({ status: 'accepted' })
      .where(and(eq(friends.myId, friendId), eq(friends.friendId, myId)))
      .returning();

    return friendship;
  }

  async removeFriend(myId: string, friendId: string) {
    const [friendship] = await this.db
      .delete(friends)
      .where(friendshipPairCondition(myId, friendId))
      .returning();

    return friendship;
  }

  async findEligibleUsers(userId: string, search?: string) {
    const friendRows = await this.db
      .select({ myId: friends.myId, friendId: friends.friendId })
      .from(friends)
      .where(or(eq(friends.myId, userId), eq(friends.friendId, userId)));
    const excluded = new Set<string>([userId]);
    for (const row of friendRows) {
      excluded.add(row.myId);
      excluded.add(row.friendId);
    }
    const excludedIds = [...excluded];
    const q = search?.trim();
    const rows = await this.db
      .select({
        id: users.id,
        username: users.username,
        displayUsername: users.displayUsername,
        name: users.name,
        avatar: users.avatar,
      })
      .from(users)
      .where(
        and(notInArray(users.id, excludedIds), q ? ilike(users.username, `%${q}%`) : undefined),
      )
      .limit(50);
    return rows;
  }
}
