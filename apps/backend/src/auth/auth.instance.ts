import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { username } from 'better-auth/plugins';
import { users, sessions, accounts, verifications } from '@repo/schemas/database';
import type { Database } from '../database/database.types';
import type { NotificationService } from '../notification/notification.service';

const logger = new Logger('Auth');

export function createAuth(
  db: Database,
  config: ConfigService,
  notificationService: NotificationService,
) {
  const mailerEngine = notificationService;

  return betterAuth({
    database: drizzleAdapter(db, {
      provider: 'pg',
      schema: {
        user: users,
        session: sessions,
        account: accounts,
        verification: verifications,
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
        isAdministrator: {
          type: 'boolean',
          input: false,
          defaultValue: false,
        },
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
    plugins: [username()],
    databaseHooks: {
      user: {
        create: {
          after: async (user, _) => {
            try {
              if (mailerEngine) {
                const dbLang = (user as any).preferedLanguage;
                const userLang = ['nl', 'es', 'ru'].includes(dbLang)
                  ? (dbLang as 'en' | 'nl' | 'es' | 'ru')
                  : 'en';

                await mailerEngine.sendWelcomeEmail(user.email, user.name, userLang);
              }
            } catch (err) {
              logger.error('Better-Auth database hook failed:', err);
            }
          },
        },
      },
    },
  });
}

export type Auth = ReturnType<typeof createAuth>;
