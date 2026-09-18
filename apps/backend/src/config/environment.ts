import { resolve } from 'node:path';
import { config as loadDotenv } from 'dotenv';
import { z } from 'zod';

const backendRoot = resolve(__dirname, '../..');
const repositoryRoot = resolve(backendRoot, '../..');

export const environmentFilePaths = [
  resolve(backendRoot, '.env'),
  resolve(repositoryRoot, '.env'),
  resolve(backendRoot, '.env.development'),
  resolve(repositoryRoot, '.env.development'),
];

loadDotenv({
  path: environmentFilePaths,
  quiet: true,
});

const booleanString = z
  .enum(['true', 'false'])
  .default('false')
  .transform((value) => value === 'true');

const environmentSchema = z
  .object({
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    PORT: z.coerce.number().int().min(1).max(65_535).default(3001),
    DATABASE_URL: z.string().url().optional(),
    REDIS_URL: z.string().url().default('redis://localhost:6380'),
    BETTER_AUTH_SECRET: z.string().min(1),
    BETTER_AUTH_URL: z.string().url().default('http://localhost:3001'),
    SEED_ADMIN_PASSWORD: z.string().min(1),
    SEED_DIDI_PASSWORD: z.string().min(1),
    SEED_HOMER_PASSWORD: z.string().min(1),
    CACHE_TTL_MS: z.coerce.number().int().positive().default(30_000),
    THROTTLE_TTL_SECONDS: z.coerce.number().int().positive().default(60),
    THROTTLE_LIMIT: z.coerce.number().int().positive().default(100),
    DEV_FIXTURES: booleanString,
    CORS_ORIGINS: z
      .string()
      .default('http://localhost:3000')
      .transform((value) =>
        value
          .split(',')
          .map((origin) => origin.trim())
          .filter(Boolean),
      )
      .pipe(z.array(z.string().url()).min(1)),
  })
  .superRefine((environment, context) => {
    if (!environment.DEV_FIXTURES && !environment.DATABASE_URL) {
      context.addIssue({
        code: 'custom',
        message: 'DATABASE_URL is required unless DEV_FIXTURES=true',
        path: ['DATABASE_URL'],
      });
    }
  });

export const environment = environmentSchema.parse(process.env);
export type Environment = z.infer<typeof environmentSchema>;
