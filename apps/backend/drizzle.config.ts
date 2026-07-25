import { defineConfig } from 'drizzle-kit';
import { config } from 'dotenv';
import { join } from 'node:path';

config({
  path: [
    join(__dirname, '.env'),
    join(__dirname, '../../.env'),
    join(__dirname, '.env.development'),
  ],
});

export default defineConfig({
  schema: join(__dirname, '../../packages/schemas/src/database.ts'),
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  verbose: true,
});
