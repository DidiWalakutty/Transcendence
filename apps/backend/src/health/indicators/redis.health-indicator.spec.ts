import { ConfigService } from '@nestjs/config';
import { HealthIndicatorService } from '@nestjs/terminus';
import { describe, expect, it, vi } from 'vitest';

import { RedisHealthIndicator } from './redis.health-indicator';

describe('RedisHealthIndicator', () => {
  it('skips the Redis probe when fixtures are enabled', async () => {
    const config = {
      getOrThrow: vi.fn().mockReturnValue(true),
    } as unknown as ConfigService;
    const indicator = new RedisHealthIndicator(new HealthIndicatorService(), config);

    await expect(indicator.isHealthy()).resolves.toEqual({
      redis: {
        status: 'up',
        mode: 'fixtures',
        skipped: true,
      },
    });
  });
});
