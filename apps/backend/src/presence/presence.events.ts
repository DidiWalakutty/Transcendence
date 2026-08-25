import { Injectable } from '@nestjs/common';
import type { PresenceChangedDto } from '@repo/schemas/presence';

import { EventsService } from '../events/events.service';

const PRESENCE_CHANGED_EVENT = 'presence.changed';

@Injectable()
export class PresenceEvents {
  constructor(private readonly eventsService: EventsService) {}

  emitPresenceChanged(payload: PresenceChangedDto) {
    return this.eventsService.emit(PRESENCE_CHANGED_EVENT, payload);
  }

  listenPresenceChanged(signal?: AbortSignal) {
    return this.eventsService.listen<PresenceChangedDto>(PRESENCE_CHANGED_EVENT, signal);
  }
}
