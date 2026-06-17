import { Injectable } from '@nestjs/common';
import type { UserDto } from '@repo/schemas/users';

import { EventsService } from '../events/events.service';

const USER_CREATED_EVENT = 'user.created';

@Injectable()
export class UsersEvents {
  constructor(private readonly eventsService: EventsService) {}

  emitUserCreated(user: UserDto) {
    this.eventsService.emit(USER_CREATED_EVENT, user);
  }

  listenUserCreated(signal?: AbortSignal) {
    return this.eventsService.listen<UserDto>(USER_CREATED_EVENT, signal);
  }
}
