import { Injectable } from '@nestjs/common';
import type { FriendDto } from '@repo/schemas/friends';
import { isSamePair } from '@repo/schemas/friends';
import type { UserDto } from '@repo/schemas/users';
import { FriendsRepository } from './friends.repository';

@Injectable()
export class InMemoryFriendsRepository extends FriendsRepository {
  private readonly friendships: FriendDto[] = [];

  async findFriends(_userId: string): Promise<UserDto[]> {
    return [];
  }

  async findPendingRequests(_userId: string): Promise<UserDto[]> {
    return [];
  }

  async addFriend(myId: string, friendId: string) {
    const friendship: FriendDto = {
      myId,
      friendId,
      status: 'pending',
      createdAt: new Date(),
    };
    this.friendships.push(friendship);
    return friendship;
  }

  async findFriendship(myId: string, friendId: string) {
    return this.friendships.find((f) => isSamePair(f, myId, friendId));
  }
  async acceptFriend(myId: string, friendId: string) {
    const friendship = this.friendships.find((f) => f.myId === friendId && f.friendId === myId);
    if (friendship) friendship.status = 'accepted';
    return friendship;
  }

  async removeFriend(myId: string, friendId: string) {
    const index = this.friendships.findIndex((f) => isSamePair(f, myId, friendId));
    if (index === -1) return undefined;
    const [friendship] = this.friendships.splice(index, 1);
    return friendship;
  }

  async findEligibleUsers(_userId: string, _search?: string) {
    return [];
  }
}
