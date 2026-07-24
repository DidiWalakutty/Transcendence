import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HealthIndicatorService } from '@nestjs/terminus';
import { createClient } from '@keyv/redis';

@Injectable()
export class RedisHealthIndicator {
  constructor(
    private readonly healthIndicator: HealthIndicatorService,
    private readonly config: ConfigService,
  ) {}

  async isHealthy() {
    const check = this.healthIndicator.check('redis');

    if (this.config.getOrThrow<boolean>('DEV_FIXTURES')) {
      return check.up({
        mode: 'fixtures',
        skipped: true,
      });
    }

    const client = createClient({
      url: this.config.getOrThrow<string>('REDIS_URL'),
      socket: {
        connectTimeout: 2_000,
        reconnectStrategy: false,
      },
    });

    try {
      await client.connect();
      await client.ping();
      return check.up();
    } catch {
      return check.down('Redis ping failed');
    } finally {
      if (client.isOpen) {
        client.destroy();
      }
    }
  }
}
