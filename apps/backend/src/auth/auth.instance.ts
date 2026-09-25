import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { betterAuth } from 'better-auth';
import { APIError } from 'better-auth/api';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { admin, username, twoFactor } from 'better-auth/plugins';
import { users, sessions, accounts, verifications, twoFactors } from '@repo/schemas/database';
import { nameField } from '@repo/schemas/fields';
import type { Database } from '../database/database.types';
import { APP_EVENTS, emitAppEvent } from '../events/app-events';

const logger = new Logger('Auth');

function validateAuthName(name: unknown, required: boolean) {
  if (name === undefined && !required) return;

  if (!nameField.safeParse(name).success) {
    throw new APIError('BAD_REQUEST', { message: 'invalid_name' });
  }
}

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
      minPasswordLength: 8,
      maxPasswordLength: 128,
      requireEmailVerification: false,
      expiresIn: 900, // 15-minute token
      sendResetPassword: async ({ user, url }) => {
        logger.log(`Password reset link for ${user.email}: ${url}`);
        emitAppEvent(APP_EVENTS.passwordResetRequested, { user, url });
      },
    },
    plugins: [
      admin(),
      username({
        minUsernameLength: 3,
        maxUsernameLength: 30,
      }),
      twoFactor({
        issuer: 'ft_transcendence',
      }),
    ],
    databaseHooks: {
      user: {
        create: {
          before: async (user) => {
            validateAuthName(user.name, true);
            return { data: user };
          },
          after: async (user) => {
            emitAppEvent(APP_EVENTS.userCreated, user);
          },
        },
        update: {
          before: async (user) => {
            validateAuthName(user.name, false);
            return { data: user };
          },
        },
      },
    },
  });
}

export type Auth = ReturnType<typeof createAuth>;
