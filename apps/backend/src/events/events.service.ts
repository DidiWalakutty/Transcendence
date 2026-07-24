import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

const MAX_BUFFERED_EVENTS = 100;

@Injectable()
export class EventsService {
  constructor(private readonly eventEmitter: EventEmitter2) {}

  emit<TPayload>(event: string, payload: TPayload) {
    this.eventEmitter.emit(event, payload);
  }

  async *listen<TPayload>(
    event: string,
    signal?: AbortSignal,
  ): AsyncGenerator<TPayload, void, void> {
    const payloads: TPayload[] = [];
    let resume: (() => void) | undefined;
    let overflowed = false;

    const onEvent = (payload: TPayload) => {
      if (payloads.length >= MAX_BUFFERED_EVENTS) {
        overflowed = true;
        resume?.();
        resume = undefined;
        return;
      }

      payloads.push(payload);
      resume?.();
      resume = undefined;
    };
    const onAbort = () => {
      resume?.();
      resume = undefined;
    };

    this.eventEmitter.on(event, onEvent);
    signal?.addEventListener('abort', onAbort, { once: true });

    try {
      while (!signal?.aborted) {
        if (payloads.length === 0) {
          await new Promise<void>((resolve) => {
            resume = resolve;
          });
        }

        if (overflowed) {
          throw new Error(`Event subscription exceeded ${MAX_BUFFERED_EVENTS} buffered messages`);
        }

        while (payloads.length > 0) {
          yield payloads.shift()!;
        }
      }
    } finally {
      this.eventEmitter.off(event, onEvent);
      signal?.removeEventListener('abort', onAbort);
    }
  }
}
