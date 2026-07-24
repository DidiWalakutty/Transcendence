import { HealthCheckService } from '@nestjs/terminus';
import { describe, expect, it, vi } from 'vitest';

import { HealthController } from './health.controller';
import { PostgresHealthIndicator } from './indicators/postgres.health-indicator';
import { RedisHealthIndicator } from './indicators/redis.health-indicator';

describe('HealthController', () => {
  it('runs the PostgreSQL and Redis health indicators', async () => {
    const postgresResult = {
      postgres: {
        status: 'up' as const,
      },
    };
    const redisResult = {
      redis: {
        status: 'up' as const,
      },
    };
    const postgresIsHealthy = vi.fn().mockResolvedValue(postgresResult);
    const redisIsHealthy = vi.fn().mockResolvedValue(redisResult);
    const postgres = {
      isHealthy: postgresIsHealthy,
    } as unknown as PostgresHealthIndicator;
    const redis = {
      isHealthy: redisIsHealthy,
    } as unknown as RedisHealthIndicator;
    const health = {
      check: vi.fn(async (indicators: Array<() => Promise<unknown>>) =>
        Promise.all(indicators.map((indicator) => indicator())),
      ),
    } as unknown as HealthCheckService;

    const controller = new HealthController(health, postgres, redis);

    await expect(controller.check()).resolves.toEqual([postgresResult, redisResult]);
    expect(postgresIsHealthy).toHaveBeenCalledOnce();
    expect(redisIsHealthy).toHaveBeenCalledOnce();
  });
});
