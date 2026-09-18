import { Router, Query, Mutation, Input, Ctx, UseMiddlewares } from 'nestjs-trpc';
import { userSchema } from '@repo/schemas/users';
import {
  addFriendSchema,
  eligibleUserSchema,
  removeFriendSchema,
  friendSchema,
  searchEligibleUsersSchema,
  type AddFriendDto,
  type RemoveFriendDto,
  type SearchEligibleUsersDto,
} from '@repo/schemas/friends';
import { orNotFound } from '../trpc/trpc.errors';
import { ProtectedMiddleware } from '../auth/protected.middleware';
import type { ProtectedCtx } from '../auth/auth.types';
import { FriendsService } from './friends.service';

@Router({ alias: 'friends' })
export class FriendsRouter {
  constructor(private readonly friendsService: FriendsService) {}

  @UseMiddlewares(ProtectedMiddleware)
  @Query({ output: userSchema.array() })
  async getFriends(@Ctx() ctx: ProtectedCtx) {
    return this.friendsService.getFriends(ctx.user.id);
  }

  @UseMiddlewares(ProtectedMiddleware)
  @Query({ output: userSchema.array() })
  async getPendingRequests(@Ctx() ctx: ProtectedCtx) {
    return this.friendsService.getPendingRequests(ctx.user.id);
  }

  @UseMiddlewares(ProtectedMiddleware)
  @Mutation({ input: addFriendSchema, output: friendSchema })
  async addFriend(@Input() input: AddFriendDto, @Ctx() ctx: ProtectedCtx) {
    return this.friendsService.addFriend(ctx.user.id, input.friendId);
  }

  @UseMiddlewares(ProtectedMiddleware)
  @Mutation({ input: addFriendSchema, output: friendSchema })
  async acceptFriend(@Input() input: AddFriendDto, @Ctx() ctx: ProtectedCtx) {
    const friendship = await this.friendsService.acceptFriend(ctx.user.id, input.friendId);
    return orNotFound(friendship, 'Friend request not found');
  }

  @UseMiddlewares(ProtectedMiddleware)
  @Mutation({ input: removeFriendSchema, output: friendSchema })
  async removeFriend(@Input() input: RemoveFriendDto, @Ctx() ctx: ProtectedCtx) {
    const friendship = await this.friendsService.removeFriend(ctx.user.id, input.friendId);
    return orNotFound(friendship, 'Friendship not found');
  }

  @UseMiddlewares(ProtectedMiddleware)
  @Query({ input: searchEligibleUsersSchema, output: eligibleUserSchema.array() })
  async getEligibleUsers(@Input() input: SearchEligibleUsersDto, @Ctx() ctx: ProtectedCtx) {
    return this.friendsService.getEligibleUsers(ctx.user.id, input.search);
  }
}
