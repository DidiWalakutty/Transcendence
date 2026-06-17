import { ConfigService } from '@nestjs/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { schema } from '@repo/schemas/database';

import { DATABASE } from './database.constants';

export const databaseProvider = {
  provide: DATABASE,
  inject: [ConfigService],
  useFactory: (config: ConfigService) => {
    const databaseUrl = config.getOrThrow<string>('DATABASE_URL');

    return drizzle(databaseUrl, {
      schema,
    });
  },
};
