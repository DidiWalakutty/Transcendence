import { EventEmitter2 } from '@nestjs/event-emitter';
import { describe, expect, it } from 'vitest';

import { EventsService } from './events.service';

describe('EventsService', () => {
  it('delivers events and removes listeners when a subscription aborts', async () => {
    const emitter = new EventEmitter2();
    const service = new EventsService(emitter);
    const abortController = new AbortController();
    const subscription = service.listen<string>('user.created', abortController.signal);
    const nextEvent = subscription.next();

    service.emit('user.created', 'payload');

    await expect(nextEvent).resolves.toEqual({
      done: false,
      value: 'payload',
    });

    const completion = subscription.next();
    abortController.abort();

    await expect(completion).resolves.toEqual({
      done: true,
      value: undefined,
    });
    expect(emitter.listenerCount('user.created')).toBe(0);
  });
});
