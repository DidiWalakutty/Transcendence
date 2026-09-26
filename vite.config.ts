import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite-plus';

const backendRoot = fileURLToPath(new URL('./apps/backend', import.meta.url));
const frontendRoot = fileURLToPath(new URL('./apps/frontend', import.meta.url));
const connectDevcontainerToComposeNetwork =
  'docker network connect "$(basename "$PWD")_default" "$(hostname)" >/dev/null 2>&1 || true';
const databaseHost = '$(if [ -f /.dockerenv ]; then printf postgres; else printf localhost; fi)';
const redisHost = '$(if [ -f /.dockerenv ]; then printf redis; else printf localhost; fi)';
const redisPort =
  '$(if [ -f /.dockerenv ]; then printf 6379; else printf "${REDIS_PORT:-6380}"; fi)';
const devDatabaseUrl = `DATABASE_URL="\${DATABASE_URL:-postgres://transcendence:transcendence@${databaseHost}:5432/transcendence}"`;
const devRedisUrl = `REDIS_URL="\${REDIS_URL:-redis://${redisHost}:${redisPort}}"`;

export default defineConfig({
  run: {
    tasks: {
      'repo:build': {
        command: 'true',
        dependsOn: ['repo:build:backend', 'repo:build:frontend'],
        cache: false,
      },
      'repo:build:backend': {
        command: 'cd apps/backend && ./node_modules/.bin/nest build',
        dependsOn: ['repo:trpc:generate'],
        cache: true,
        input: [{ auto: true }, '!apps/backend/dist/**', '!apps/backend/tsconfig.tsbuildinfo'],
        output: [{ pattern: 'apps/backend/dist/**', base: 'workspace' }],
      },
      'repo:build:frontend': {
        command: 'cd apps/frontend && ./node_modules/.bin/vite build',
        dependsOn: ['repo:trpc:generate', 'repo:frontend:generate'],
        cache: true,
        env: ['VITE_*', 'SERVER_URL'],
        input: [
          { auto: true },
          '!apps/frontend/.output/**',
          '!apps/frontend/.tanstack/**',
          '!apps/frontend/src/@generated/paraglide/**',
          '!apps/frontend/src/routeTree.gen.ts',
          '!apps/frontend/node_modules/.nitro/**',
          '!apps/frontend/node_modules/.vite-temp/**',
        ],
        output: [
          { pattern: 'apps/frontend/.output/**', base: 'workspace' },
          { pattern: 'apps/frontend/.tanstack/**', base: 'workspace' },
        ],
      },
      'repo:check': {
        command: 'vp check',
        dependsOn: ['repo:trpc:generate', 'repo:frontend:generate'],
      },
      'repo:check:backend': {
        command: 'vp check apps/backend packages/schemas',
        dependsOn: ['repo:trpc:generate'],
      },
      'repo:check:fix': {
        command: 'vp check --fix',
        dependsOn: ['repo:trpc:generate', 'repo:frontend:generate'],
        cache: false,
      },
      'repo:check:fix:backend': {
        command: 'vp check --fix apps/backend packages/schemas',
        dependsOn: ['repo:trpc:generate'],
        cache: false,
      },
      'repo:check:fix:frontend': {
        command: 'vp check --fix apps/frontend packages/schemas',
        dependsOn: ['repo:trpc:generate', 'repo:frontend:generate'],
        cache: false,
      },
      'repo:check:frontend': {
        command: 'vp check apps/frontend packages/schemas',
        dependsOn: ['repo:trpc:generate', 'repo:frontend:generate'],
      },
      'repo:db:generate': {
        command: 'vp exec --filter @repo/backend drizzle-kit generate --config drizzle.config.ts',
        cache: false,
      },
      'repo:db:setup': {
        command: `${connectDevcontainerToComposeNetwork} && docker compose up -d --wait postgres && ${devDatabaseUrl} vp exec --filter @repo/backend drizzle-kit migrate --config drizzle.config.ts`,
        cache: false,
      },
      'repo:db:migrate': {
        command: `${connectDevcontainerToComposeNetwork} && ${devDatabaseUrl} vp exec --filter @repo/backend drizzle-kit migrate --config drizzle.config.ts`,
        dependsOn: ['repo:services:setup'],
        cache: false,
      },
      'repo:db:push': {
        command: `${connectDevcontainerToComposeNetwork} && ${devDatabaseUrl} vp exec --filter @repo/backend drizzle-kit push --config drizzle.config.ts`,
        cache: false,
      },
      'repo:db:seed': {
        command: `${connectDevcontainerToComposeNetwork} && ${devDatabaseUrl} vp exec --filter @repo/backend bun seed.ts`,
        dependsOn: ['repo:db:migrate'],
        cache: false,
      },
      'repo:db:studio': {
        command: `${connectDevcontainerToComposeNetwork} && ${devDatabaseUrl} vp exec --filter @repo/backend drizzle-kit studio --config drizzle.config.ts`,
        cache: false,
      },
      'repo:deploy': {
        command: 'docker compose --env-file .env up --build',
        cache: false,
      },
      'repo:deploy:detached': {
        command: 'docker compose --env-file .env up -d --build',
        cache: false,
      },
      'repo:dev': {
        command: `${devDatabaseUrl} ${devRedisUrl} vp run --filter @repo/backend --fail-if-no-match dev & backend_task_pid=$!; trap 'kill "$backend_task_pid" 2>/dev/null || true' EXIT; until curl --fail --silent http://127.0.0.1:3001/health >/dev/null 2>&1; do if ! kill -0 "$backend_task_pid" 2>/dev/null; then wait "$backend_task_pid"; exit 1; fi; sleep 1; done; vp run --filter @repo/frontend --fail-if-no-match --parallel dev`,
        dependsOn: ['repo:dev:prepare'],
        cache: false,
      },
      'repo:dev:backend': {
        command: `${devDatabaseUrl} ${devRedisUrl} vp run --filter @repo/backend --fail-if-no-match --parallel dev`,
        dependsOn: ['repo:dev:backend:prepare'],
        cache: false,
      },
      'repo:dev:backend:prepare': {
        command: 'true',
        dependsOn: ['repo:services:setup', 'repo:trpc:generate'],
        cache: false,
      },
      'repo:dev:fixtures': {
        command:
          'DEV_FIXTURES=true vp run --filter @repo/backend --filter @repo/frontend --fail-if-no-match --parallel dev',
        dependsOn: ['repo:dev:fixtures:prepare'],
        cache: false,
      },
      'repo:dev:fixtures:prepare': {
        command: 'true',
        dependsOn: ['repo:frontend:generate'],
        cache: false,
      },
      'repo:dev:frontend': {
        command: 'vp run --filter @repo/frontend --fail-if-no-match --parallel dev',
        dependsOn: ['repo:dev:frontend:prepare'],
        cache: false,
      },
      'repo:dev:frontend:prepare': {
        command: 'true',
        dependsOn: ['repo:frontend:generate'],
        cache: false,
      },
      'repo:dev:prepare': {
        command: 'true',
        dependsOn: ['repo:services:setup', 'repo:frontend:generate'],
        cache: false,
      },
      'repo:frontend:generate': {
        command:
          'vp exec --filter @repo/frontend paraglide-js compile --project ./project.inlang --outdir ./src/@generated/paraglide --strategy url baseLocale --silent && vp exec --filter @repo/frontend tsr generate',
        dependsOn: ['repo:trpc:generate'],
        cache: false,
      },
      'repo:lint': {
        command: 'vp lint',
        dependsOn: ['repo:trpc:generate', 'repo:frontend:generate'],
      },
      'repo:lint:backend': {
        command: 'vp lint apps/backend packages/schemas',
        dependsOn: ['repo:trpc:generate'],
      },
      'repo:lint:frontend': {
        command: 'vp lint apps/frontend packages/schemas',
        dependsOn: ['repo:trpc:generate', 'repo:frontend:generate'],
      },
      'repo:redis:setup': {
        command: 'docker compose up -d redis',
        cache: false,
      },
      'repo:services:setup': {
        command: `docker compose up -d --wait postgres redis mailpit`,
        cache: false,
      },
      'repo:staged': {
        command: 'vp staged',
        dependsOn: ['repo:trpc:generate', 'repo:frontend:generate'],
        cache: false,
      },
      'repo:test': {
        command: 'true',
        dependsOn: ['repo:test:backend', 'repo:test:frontend'],
        cache: false,
      },
      'repo:test:backend': {
        command: 'vp test --project backend',
        dependsOn: ['repo:trpc:generate'],
        env: [
          'NODE_ENV',
          'DATABASE_URL',
          'REDIS_URL',
          'BETTER_AUTH_*',
          'SEED_*',
          'CORS_ORIGINS',
          'DEV_FIXTURES',
        ],
      },
      'repo:test:backend:e2e': {
        command: 'vp test --project backend test/app.e2e-spec.ts',
        dependsOn: ['repo:trpc:generate'],
      },
      'repo:test:e2e': {
        command: './node_modules/.bin/playwright test',
        cache: false,
      },
      'repo:test:e2e:install': {
        command: './node_modules/.bin/playwright install chromium firefox',
        cache: false,
      },
      'repo:test:frontend': {
        command: 'vp test --project frontend',
        dependsOn: ['repo:trpc:generate', 'repo:frontend:generate'],
      },
      'repo:trpc:generate': {
        command:
          'if [ -d /goinfre ]; then vp exec --filter @repo/backend ../../bin/nestjs-trpc generate --entrypoint src/app.module.ts --output ../../packages/schemas/src/@generated; else vp exec --filter @repo/backend bunx nestjs-trpc generate --entrypoint src/app.module.ts --output ../../packages/schemas/src/@generated; fi',
        cache: false,
      },
      'repo:trpc:watch': {
        command:
          'vp exec --filter @repo/backend ../../bin/nestjs-trpc watch --entrypoint src/app.module.ts --output ../../packages/schemas/src/@generated',
        cache: false,
      },
    },
  },
  fmt: {
    ignorePatterns: [
      '**/dist/**',
      '**/dev-dist/**',
      '**/.output/**',
      '**/node_modules/**',
      '**/routeTree.gen.ts',
      // Generated HTML reports under docs/ are not hand-edited.
      'docs/**/*.html',
    ],
    singleQuote: true,
    semi: true,
    sortPackageJson: true,
  },
  lint: {
    ignorePatterns: [
      '**/dist/**',
      '**/dev-dist/**',
      '**/.output/**',
      '**/node_modules/**',
      '**routeTree.gen.ts',
      '**/@generated/**',
    ],
    plugins: ['typescript'],
    options: {
      typeAware: true,
      typeCheck: true,
    },
    overrides: [
      {
        files: ['apps/frontend/**'],
        plugins: ['typescript', 'react'],
      },
      {
        files: ['apps/backend/**', 'packages/**'],
        env: {
          node: true,
        },
      },
      {
        files: ['**/*.spec.ts', '**/*.test.ts', '**/*.spec.tsx', '**/*.test.tsx'],
        env: {
          node: true,
        },
        rules: {
          'typescript/no-explicit-any': 'off',
        },
      },
    ],
  },
  test: {
    passWithNoTests: true,
    projects: [
      {
        test: {
          name: 'backend',
          environment: 'node',
          root: backendRoot,
          include: ['**/*.spec.ts', '**/*.e2e-spec.ts'],
        },
      },
      {
        resolve: { alias: { '@': fileURLToPath(new URL('./apps/frontend/src', import.meta.url)) } },
        test: {
          name: 'frontend',
          environment: 'jsdom',
          root: frontendRoot,
          include: ['src/**/*.{test,spec}.{ts,tsx}'],
        },
      },
    ],
  },
  staged: {
    '*.{js,jsx,ts,tsx,json,jsonc,css,md}': 'vp check --fix',
  },
});
