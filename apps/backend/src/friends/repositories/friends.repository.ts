import type { FriendDto } from '@repo/schemas/friends';
import type { UserDto } from '@repo/schemas/users';

export abstract class FriendsRepository {
  abstract findFriends(userId: string): Promise<UserDto[]>;
  abstract findPendingRequests(userId: string): Promise<UserDto[]>;
  abstract addFriend(myId: string, friendId: string): Promise<FriendDto>;
  abstract acceptFriend(myId: string, friendId: string): Promise<FriendDto | undefined>;
  abstract removeFriend(myId: string, friendId: string): Promise<FriendDto | undefined>;
  abstract findFriendship(myId: string, friendId: string): Promise<FriendDto | undefined>;
}
