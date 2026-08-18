import { Inject, Injectable } from '@nestjs/common';
import { and, eq, or } from 'drizzle-orm';
import { friends, users } from '@repo/schemas/database';
import { DATABASE } from '../../database/database.constants';
import type { Database } from '../../database/database.types';
import { FriendsRepository } from './friends.repository';

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
      where: or(
        and(eq(friends.myId, myId), eq(friends.friendId, friendId)),
        and(eq(friends.myId, friendId), eq(friends.friendId, myId)),
      ),
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
      .where(
        or(
          and(eq(friends.myId, myId), eq(friends.friendId, friendId)),
          and(eq(friends.myId, friendId), eq(friends.friendId, myId)),
        ),
      )
      .returning();

    return friendship;
  }
}
