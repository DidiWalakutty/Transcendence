import { Injectable } from '@nestjs/common';
import { FriendsRepository } from './repositories/friends.repository';
import { conflictError } from '../trpc/trpc.errors';

@Injectable()
export class FriendsService {
  constructor(private readonly repository: FriendsRepository) {}

  async getFriends(userId: string) {
    return this.repository.findFriends(userId);
  }

  async addFriend(myId: string, friendId: string) {
    if (myId === friendId) {
      throw conflictError('You cannot add yourself as a friend');
    }

    const existing = await this.repository.findFriendship(myId, friendId);
    if (existing) {
      throw conflictError('Friend request already exists');
    }

    return this.repository.addFriend(myId, friendId);
  }

  async getPendingRequests(userId: string) {
    return this.repository.findPendingRequests(userId);
  }

  async acceptFriend(myId: string, friendId: string) {
    return this.repository.acceptFriend(myId, friendId);
  }

  async removeFriend(myId: string, friendId: string) {
    return this.repository.removeFriend(myId, friendId);
  }
}
