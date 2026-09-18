import { Injectable } from '@nestjs/common';
import type { UserChangedDto, UserDto } from '@repo/schemas/users';

import { EventsService } from '../events/events.service';

const USER_CREATED_EVENT = 'user.created';
const USER_UPDATED_EVENT = 'user.updated';
const USER_DELETED_EVENT = 'user.deleted';
// Single multiplexed channel so the admin dashboard needs one SSE connection
// instead of three. Browsers allow ~6 concurrent connections per origin; with
// event, presence and chat streams the three legacy channels leave no slot for
// mutations, which then hang forever on "Saving changes…".
const USER_CHANGED_EVENT = 'user.changed';

@Injectable()
export class UsersEvents {
  constructor(private readonly eventsService: EventsService) {}

  emitUserCreated(user: UserDto) {
    this.eventsService.emit(USER_CREATED_EVENT, user);
    this.eventsService.emit<UserChangedDto>(USER_CHANGED_EVENT, { action: 'created', user });
  }

  emitUserUpdated(user: UserDto) {
    this.eventsService.emit(USER_UPDATED_EVENT, user);
    this.eventsService.emit<UserChangedDto>(USER_CHANGED_EVENT, { action: 'updated', user });
  }

  emitUserDeleted(user: UserDto) {
    this.eventsService.emit(USER_DELETED_EVENT, user);
    this.eventsService.emit<UserChangedDto>(USER_CHANGED_EVENT, { action: 'deleted', user });
  }

  listenUserChanged(signal?: AbortSignal) {
    return this.eventsService.listen<UserChangedDto>(USER_CHANGED_EVENT, signal);
  }

  listenUserCreated(signal?: AbortSignal) {
    return this.eventsService.listen<UserDto>(USER_CREATED_EVENT, signal);
  }

  listenUserUpdated(signal?: AbortSignal) {
    return this.eventsService.listen<UserDto>(USER_UPDATED_EVENT, signal);
  }

  listenUserDeleted(signal?: AbortSignal) {
    return this.eventsService.listen<UserDto>(USER_DELETED_EVENT, signal);
  }
}
