import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { admin, username, twoFactor } from 'better-auth/plugins';
import { users, sessions, accounts, verifications, twoFactors } from '@repo/schemas/database';
import type { Database } from '../database/database.types';
import { APP_EVENTS, emitAppEvent } from '../events/app-events';

const logger = new Logger('Auth');

export function createAuth(db: Database, config: ConfigService) {
  return betterAuth({
    database: drizzleAdapter(db, {
      provider: 'pg',
      schema: {
        user: users,
        session: sessions,
        account: accounts,
        verification: verifications,
        twoFactor: twoFactors,
      },
    }),
    secret: config.getOrThrow<string>('BETTER_AUTH_SECRET'),
    baseURL: config.getOrThrow<string>('BETTER_AUTH_URL'),
    trustedOrigins: config.getOrThrow<string[]>('CORS_ORIGINS'),
    advanced: {
      database: {
        generateId: 'uuid',
      },
    },
    user: {
      fields: {
        image: 'avatar',
      },
      additionalFields: {
        aboutMe: {
          type: 'string',
          required: false,
        },
        location: {
          type: 'string',
          required: false,
        },
        preferedLanguage: {
          type: 'string',
          required: false,
          defaultValue: 'en',
        },
      },
    },
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: false,
      sendResetPassword: async ({ user, url }) => {
        logger.log(`Password reset link for ${user.email}: ${url}`);
      },
    },
    plugins: [
      admin(),
      username(),
      twoFactor({
        issuer: 'ft_transcendence',
      }),
    ],
    databaseHooks: {
      user: {
        create: {
          after: async (user) => {
            emitAppEvent(APP_EVENTS.userCreated, user);
          },
        },
      },
    },
  });
}

export type Auth = ReturnType<typeof createAuth>;
