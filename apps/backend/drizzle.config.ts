import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';
import { join } from 'node:path';

export default defineConfig({
  schema: join(__dirname, '../../packages/schemas/src/database.ts'),
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
