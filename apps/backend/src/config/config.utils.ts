import type { ConfigService } from '@nestjs/config';

export const getRedisUrl = (config: ConfigService) =>
  config.get<string>('REDIS_URL') ??
  `redis://localhost:${config.get<string>('REDIS_PORT') ?? '6379'}`;

export const getNumber = (config: ConfigService, key: string, fallback: number) => {
  const value = config.get<string | number>(key);
  const parsedValue = typeof value === 'number' ? value : Number(value);

  return Number.isFinite(parsedValue) ? parsedValue : fallback;
};
