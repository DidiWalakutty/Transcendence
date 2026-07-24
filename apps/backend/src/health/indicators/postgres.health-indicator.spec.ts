import { ConfigService } from '@nestjs/config';
import { HealthIndicatorService } from '@nestjs/terminus';
import { describe, expect, it, vi } from 'vitest';

import { DatabaseService } from '../../database/database.service';
import { PostgresHealthIndicator } from './postgres.health-indicator';

describe('PostgresHealthIndicator', () => {
  const healthIndicator = new HealthIndicatorService();

  it('skips the database probe when fixtures are enabled', async () => {
    const config = {
      getOrThrow: vi.fn().mockReturnValue(true),
    } as unknown as ConfigService;
    const indicator = new PostgresHealthIndicator(healthIndicator, config);

    await expect(indicator.isHealthy()).resolves.toEqual({
      postgres: {
        status: 'up',
        mode: 'fixtures',
        skipped: true,
      },
    });
  });

  it('reports a successful database ping', async () => {
    const config = {
      getOrThrow: vi.fn().mockReturnValue(false),
    } as unknown as ConfigService;
    const ping = vi.fn().mockResolvedValue(undefined);
    const database = {
      ping,
    } as unknown as DatabaseService;
    const indicator = new PostgresHealthIndicator(healthIndicator, config, database);

    await expect(indicator.isHealthy()).resolves.toEqual({
      postgres: {
        status: 'up',
      },
    });
    expect(ping).toHaveBeenCalledOnce();
  });

  it('reports a failed database ping', async () => {
    const config = {
      getOrThrow: vi.fn().mockReturnValue(false),
    } as unknown as ConfigService;
    const database = {
      ping: vi.fn().mockRejectedValue(new Error('unavailable')),
    } as unknown as DatabaseService;
    const indicator = new PostgresHealthIndicator(healthIndicator, config, database);

    await expect(indicator.isHealthy()).resolves.toEqual({
      postgres: {
        status: 'down',
        message: 'PostgreSQL ping failed',
      },
    });
  });
});
