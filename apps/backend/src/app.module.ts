import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { TRPCModule } from 'nestjs-trpc';
import superjson from 'superjson';
import { CacheModule } from '@nestjs/cache-manager';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerGuard, ThrottlerModule, seconds } from '@nestjs/throttler';
import { ThrottlerStorageRedisService } from '@nest-lab/throttler-storage-redis';
import { createKeyv } from '@keyv/redis';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ExampleRouter } from './trpc.router';
import { EventsModule } from './events/events.module';
import { UsersModule } from './users/users.module';

const getRedisUrl = (config: ConfigService) =>
  config.get<string>('REDIS_URL') ??
  `redis://localhost:${config.get<string>('REDIS_PORT') ?? '6379'}`;

const getNumber = (config: ConfigService, key: string, fallback: number) => {
  const value = config.get<string | number>(key);
  const parsedValue = typeof value === 'number' ? value : Number(value);

  return Number.isFinite(parsedValue) ? parsedValue : fallback;
};

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: [
        'apps/backend/.env',
        '.env',
        'apps/backend/.env.development',
        '.env.development',
      ],
      isGlobal: true,
    }),
    CacheModule.registerAsync({
      isGlobal: true,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        ttl: getNumber(config, 'CACHE_TTL_MS', 30_000),
        stores: [
          createKeyv(getRedisUrl(config), {
            namespace: 'ft_transcendence:cache',
          }),
        ],
      }),
    }),
    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        skipIf: () => config.get<string>('NODE_ENV') === 'test',
        storage: new ThrottlerStorageRedisService(getRedisUrl(config)),
        throttlers: [
          {
            name: 'default',
            ttl: seconds(getNumber(config, 'THROTTLE_TTL_SECONDS', 60)),
            limit: getNumber(config, 'THROTTLE_LIMIT', 100),
          },
        ],
      }),
    }),
    EventsModule,
    UsersModule,
    TRPCModule.forRoot({
      basePath: '/api/trpc',
      transformer: superjson,
    }),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    ExampleRouter,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
