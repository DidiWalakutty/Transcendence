import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

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

    const onEvent = (payload: TPayload) => {
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
