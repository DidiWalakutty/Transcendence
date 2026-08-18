import { Router, Query, Mutation, Input, Ctx } from 'nestjs-trpc';
import { userSchema } from '@repo/schemas/users';
import {
  addFriendSchema,
  removeFriendSchema,
  friendSchema,
  type AddFriendDto,
  type RemoveFriendDto,
} from '@repo/schemas/friends';
import { unauthorizedError, notFoundError } from '../trpc/trpc.errors';
import { FriendsService } from './friends.service';

@Router({ alias: 'friends' })
export class FriendsRouter {
  constructor(private readonly friendsService: FriendsService) {}

  @Query({ output: userSchema.array() })
  async getFriends(@Ctx() ctx: { user: { id: string } | null }) {
    if (!ctx.user) throw unauthorizedError('Not logged in');
    return this.friendsService.getFriends(ctx.user.id);
  }

  @Query({ output: userSchema.array() })
  async getPendingRequests(@Ctx() ctx: { user: { id: string } | null }) {
    if (!ctx.user) throw unauthorizedError('Not logged in');
    return this.friendsService.getPendingRequests(ctx.user.id);
  }

  @Mutation({ input: addFriendSchema, output: friendSchema })
  async addFriend(@Input() input: AddFriendDto, @Ctx() ctx: { user: { id: string } | null }) {
    if (!ctx.user) throw unauthorizedError('Not logged in');
    return this.friendsService.addFriend(ctx.user.id, input.friendId);
  }

  @Mutation({ input: addFriendSchema, output: friendSchema })
  async acceptFriend(@Input() input: AddFriendDto, @Ctx() ctx: { user: { id: string } | null }) {
    if (!ctx.user) throw unauthorizedError('Not logged in');
    const friendship = await this.friendsService.acceptFriend(ctx.user.id, input.friendId);
    if (!friendship) throw notFoundError('Friend request not found');
    return friendship;
  }

  @Mutation({ input: removeFriendSchema, output: friendSchema })
  async removeFriend(@Input() input: RemoveFriendDto, @Ctx() ctx: { user: { id: string } | null }) {
    if (!ctx.user) throw unauthorizedError('Not logged in');
    const friendship = await this.friendsService.removeFriend(ctx.user.id, input.friendId);
    if (!friendship) throw notFoundError('Friendship not found');
    return friendship;
  }
}
