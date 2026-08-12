import { defineConfig } from 'drizzle-kit';
import { config } from 'dotenv';

config({
  path: ['.env', '../../.env', '.env.development'],
});

export default defineConfig({
  schema: '../../packages/schemas/src/database.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  verbose: true,
});
