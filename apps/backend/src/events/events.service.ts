import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';
import Redis from 'ioredis';
import { getRedisUrl } from '../config/config.utils';

@Injectable()
export class EventsService implements OnModuleDestroy {
  private readonly logger = new Logger(EventsService.name);
  private readonly publisher: Redis;
  private readonly subscriber: Redis;
  private readonly subscriptionCounts = new Map<string, number>();

  constructor(
    private readonly eventEmitter: EventEmitter2,
    config: ConfigService,
  ) {
    const options = {
      enableOfflineQueue: false,
      lazyConnect: true,
      maxRetriesPerRequest: 1,
    };

    this.publisher = new Redis(getRedisUrl(config), options);
    this.subscriber = new Redis(getRedisUrl(config), options);
    this.publisher.on('error', () => undefined);
    this.subscriber.on('error', () => undefined);
  }

  async emit<TPayload>(event: string, payload: TPayload) {
    try {
      await this.connect(this.publisher);
      await this.publisher.publish(event, JSON.stringify(payload));
    } catch (error) {
      this.logger.warn(`Redis publish failed for ${event}; falling back to local events`);
      this.logDebug(error);
      this.eventEmitter.emit(event, payload);
    }
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
    const onRedisMessage = (channel: string, message: string) => {
      if (channel !== event) {
        return;
      }

      try {
        onEvent(JSON.parse(message) as TPayload);
      } catch (error) {
        this.logger.warn(`Ignored invalid Redis payload on ${channel}`);
        this.logDebug(error);
      }
    };

    const onAbort = () => {
      resume?.();
      resume = undefined;
    };

    this.eventEmitter.on(event, onEvent);
    this.subscriber.on('message', onRedisMessage);
    signal?.addEventListener('abort', onAbort, { once: true });
    await this.subscribe(event);

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
      this.subscriber.off('message', onRedisMessage);
      signal?.removeEventListener('abort', onAbort);
      await this.unsubscribe(event);
    }
  }

  async onModuleDestroy() {
    await Promise.allSettled([this.publisher.quit(), this.subscriber.quit()]);
  }

  private async subscribe(event: string) {
    const count = this.subscriptionCounts.get(event) ?? 0;
    this.subscriptionCounts.set(event, count + 1);

    if (count > 0) {
      return;
    }

    try {
      await this.connect(this.subscriber);
      await this.subscriber.subscribe(event);
    } catch (error) {
      this.subscriptionCounts.delete(event);
      this.logger.warn(`Redis subscribe failed for ${event}; local events only until resubscribed`);
      this.logDebug(error);
    }
  }

  private async unsubscribe(event: string) {
    const count = this.subscriptionCounts.get(event) ?? 0;

    if (count > 1) {
      this.subscriptionCounts.set(event, count - 1);
      return;
    }

    this.subscriptionCounts.delete(event);

    try {
      if (this.subscriber.status !== 'ready') {
        return;
      }

      await this.subscriber.unsubscribe(event);
    } catch (error) {
      this.logDebug(error);
    }
  }

  private async connect(redis: Redis) {
    if (redis.status === 'ready') {
      return;
    }

    if (redis.status === 'connecting' || redis.status === 'connect') {
      await new Promise<void>((resolve, reject) => {
        redis.once('ready', resolve);
        redis.once('error', reject);
      });
      return;
    }

    await redis.connect();
  }

  private logDebug(error: unknown) {
    this.logger.debug(error instanceof Error ? error.message : String(error));
  }
}
