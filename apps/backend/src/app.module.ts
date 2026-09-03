import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { TRPCModule } from 'nestjs-trpc';
import superjson from 'superjson';
import { CacheModule } from '@nestjs/cache-manager';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerGuard, ThrottlerModule, seconds } from '@nestjs/throttler';
import { ThrottlerStorageRedisService } from '@nest-lab/throttler-storage-redis';
import { createKeyv } from '@keyv/redis';
import { environment, environmentFilePaths } from './config/environment';
import { HealthModule } from './health/health.module';
import { UsersModule } from './users/users.module';
import { EventListingsModule } from './event-listings/event-listings.module';
import { EventsModule } from './events/events.module';
import { FriendsModule } from './friends/friends.module';
import { PresenceModule } from './presence/presence.module';
import { RegistrationsModule } from './registrations/registrations.module';
import { AuthModule } from './auth/auth.module';
import { AuthContext } from './auth/auth.context';
import { NotificationModule } from './notification/notification.module';

// Main backend module:
// - imports and connects all application modules
// - configures shared infrastructure such as the database, cache, auth tRPC, and event handling

@Module({
  imports: [
    ConfigModule.forRoot({
      cache: true,
      envFilePath: environmentFilePaths,
      isGlobal: true,
      validate: () => environment,
    }),
    CacheModule.registerAsync({
      isGlobal: true,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const useFixtures = config.getOrThrow<boolean>('DEV_FIXTURES');

        return {
          ttl: config.getOrThrow<number>('CACHE_TTL_MS'),
          ...(useFixtures
            ? {}
            : {
                stores: [
                  createKeyv(config.getOrThrow<string>('REDIS_URL'), {
                    namespace: 'ft_transcendence:cache',
                  }),
                ],
              }),
        };
      },
    }),
    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const useFixtures = config.getOrThrow<boolean>('DEV_FIXTURES');

        return {
          skipIf: () => config.get<string>('NODE_ENV') === 'test',
          ...(useFixtures
            ? {}
            : {
                storage: new ThrottlerStorageRedisService(config.getOrThrow<string>('REDIS_URL')),
              }),
          throttlers: [
            {
              name: 'default',
              ttl: seconds(config.getOrThrow<number>('THROTTLE_TTL_SECONDS')),
              limit: config.getOrThrow<number>('THROTTLE_LIMIT'),
            },
          ],
        };
      },
    }),
    EventEmitterModule.forRoot(),
    HealthModule.register({
      useFixtures: environment.DEV_FIXTURES,
    }),
    UsersModule.register({
      persistence: environment.DEV_FIXTURES ? 'fixtures' : 'database',
    }),
    EventListingsModule.register({
      persistence: environment.DEV_FIXTURES ? 'fixtures' : 'database',
    }),
    EventsModule,
    RegistrationsModule,
    FriendsModule.register({
      persistence: environment.DEV_FIXTURES ? 'fixtures' : 'database',
    }),
    PresenceModule,
    AuthModule,
    TRPCModule.forRoot({
      basePath: '/api/trpc',
      transformer: superjson,
      context: AuthContext,
    }),
    NotificationModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
