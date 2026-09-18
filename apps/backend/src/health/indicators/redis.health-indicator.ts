import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HealthIndicatorService } from '@nestjs/terminus';
import { createClient } from '@keyv/redis';
import { BaseHealthIndicator } from './base.health-indicator';

@Injectable()
export class RedisHealthIndicator extends BaseHealthIndicator {
  constructor(healthIndicator: HealthIndicatorService, config: ConfigService) {
    super(healthIndicator, config);
  }

  async isHealthy() {
    if (this.isFixtureMode()) {
      return this.fixturesSkip('redis');
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
      return this.healthIndicator.check('redis').up();
    } catch {
      return this.healthIndicator.check('redis').down('Redis ping failed');
    } finally {
      if (client.isOpen) {
        client.destroy();
      }
    }
  }
}
