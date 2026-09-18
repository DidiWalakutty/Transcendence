import { ConfigService } from '@nestjs/config';
import { HealthIndicatorService } from '@nestjs/terminus';
import { describe, expect, it, vi } from 'vitest';
import { createClient } from '@keyv/redis';

import { RedisHealthIndicator } from './redis.health-indicator';

vi.mock('@keyv/redis', () => ({
  createClient: vi.fn(),
}));

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

  it('reports a successful Redis ping and closes the client', async () => {
    const client = {
      connect: vi.fn().mockResolvedValue(undefined),
      ping: vi.fn().mockResolvedValue('PONG'),
      isOpen: true,
      destroy: vi.fn(),
    };
    vi.mocked(createClient).mockReturnValue(client as never);
    const config = {
      getOrThrow: vi.fn((key: string) => (key === 'DEV_FIXTURES' ? false : 'redis://redis')),
    } as unknown as ConfigService;
    const indicator = new RedisHealthIndicator(new HealthIndicatorService(), config);

    await expect(indicator.isHealthy()).resolves.toEqual({ redis: { status: 'up' } });
    expect(client.connect).toHaveBeenCalledOnce();
    expect(client.ping).toHaveBeenCalledOnce();
    expect(client.destroy).toHaveBeenCalledOnce();
  });

  it('reports a failed Redis ping and closes an open client', async () => {
    const client = {
      connect: vi.fn().mockResolvedValue(undefined),
      ping: vi.fn().mockRejectedValue(new Error('unavailable')),
      isOpen: true,
      destroy: vi.fn(),
    };
    vi.mocked(createClient).mockReturnValue(client as never);
    const config = {
      getOrThrow: vi.fn((key: string) => (key === 'DEV_FIXTURES' ? false : 'redis://redis')),
    } as unknown as ConfigService;
    const indicator = new RedisHealthIndicator(new HealthIndicatorService(), config);

    await expect(indicator.isHealthy()).resolves.toEqual({
      redis: { status: 'down', message: 'Redis ping failed' },
    });
    expect(client.destroy).toHaveBeenCalledOnce();
  });
});
