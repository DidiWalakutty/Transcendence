import { Logger, Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { TRPCModule } from 'nestjs-trpc';
import superjson from 'superjson';
import { CacheModule } from '@nestjs/cache-manager';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerGuard, ThrottlerModule, seconds } from '@nestjs/throttler';
import { createKeyv } from '@keyv/redis';
import { environment, environmentFilePaths } from './config/environment';
import { HealthModule } from './health/health.module';
import { UsersModule } from './users/users.module';
import { EventListingsModule } from './event-listings/event-listings.module';
import { EventsModule } from './events/events.module';
import { FriendsModule } from './friends/friends.module';
import { PresenceModule } from './presence/presence.module';
import { ChatModule } from './chat/chat.module';
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
        return {
          skipIf: () =>
            !config.getOrThrow<boolean>('THROTTLE_ENABLED') ||
            config.get<string>('NODE_ENV') === 'test',
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
    ChatModule,
    AuthModule,
    TRPCModule.forRoot({
      basePath: '/api/trpc',
      transformer: superjson,
      context: AuthContext,
      // An unexpected failure (a database error, for instance) carries its
      // internals in the message. Log those here and hand the browser a
      // generic message in production; expected errors (NOT_FOUND, FORBIDDEN,
      // BAD_REQUEST…) pass through unchanged.
      errorFormatter: ({ shape, error }) => {
        if (error.code !== 'INTERNAL_SERVER_ERROR') return shape;
        Logger.error(error.cause ?? error, 'tRPC');
        return environment.NODE_ENV === 'production'
          ? { ...shape, message: 'Internal server error' }
          : shape;
      },
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
