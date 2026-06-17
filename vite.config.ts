import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite-plus';

const backendRoot = fileURLToPath(new URL('./apps/backend', import.meta.url));
const frontendRoot = fileURLToPath(new URL('./apps/frontend', import.meta.url));

export default defineConfig({
  run: {
    tasks: {
      'repo:trpc:generate': {
        command:
          'vp exec --filter @repo/backend nestjs-trpc generate --entrypoint src/app.module.ts --output ../../packages/schemas/src/@generated && vp fmt packages/schemas/src/@generated/server.ts --write',
        cache: false,
      },
      'repo:frontend:generate': {
        command:
          'vp exec --filter @repo/frontend paraglide-js compile --project ./project.inlang --outdir ./src/@generated/paraglide --strategy url baseLocale --silent && vp exec --filter @repo/frontend tsr generate',
        cache: false,
      },
      'repo:dev': {
        command:
          'vp run --filter @repo/backend --filter @repo/frontend --fail-if-no-match --parallel dev',
        dependsOn: [
          'repo:db:setup',
          'repo:redis:setup',
          'repo:trpc:generate',
          'repo:frontend:generate',
        ],
        cache: false,
      },
      'repo:dev:frontend': {
        command: 'vp run --filter @repo/frontend --fail-if-no-match --parallel dev',
        dependsOn: ['repo:trpc:generate', 'repo:frontend:generate'],
        cache: false,
      },
      'repo:dev:backend': {
        command: 'vp run --filter @repo/backend --fail-if-no-match --parallel dev',
        dependsOn: ['repo:db:setup', 'repo:redis:setup', 'repo:trpc:generate'],
        cache: false,
      },
      'repo:db:setup': {
        command: 'docker compose up -d postgres && vp run -w repo:db:migrate',
        cache: false,
      },
      'repo:redis:setup': {
        command: 'docker compose up -d redis',
        cache: false,
      },
      'repo:db:generate': {
        command: 'vp exec --filter @repo/backend drizzle-kit generate --config drizzle.config.ts',
        cache: false,
      },
      'repo:db:migrate': {
        command: 'vp exec --filter @repo/backend drizzle-kit migrate --config drizzle.config.ts',
        cache: false,
      },
      'repo:db:push': {
        command: 'vp exec --filter @repo/backend drizzle-kit push --config drizzle.config.ts',
        cache: false,
      },
      'repo:db:studio': {
        command: 'vp exec --filter @repo/backend drizzle-kit studio --config drizzle.config.ts',
        cache: false,
      },
      'repo:build': {
        command: 'vp run --filter @repo/backend --filter @repo/frontend --fail-if-no-match build',
        dependsOn: ['repo:trpc:generate', 'repo:frontend:generate'],
      },
      'repo:build:frontend': {
        command: 'vp run --filter @repo/frontend --fail-if-no-match build',
        dependsOn: ['repo:trpc:generate', 'repo:frontend:generate'],
      },
      'repo:build:backend': {
        command: 'vp run --filter @repo/backend --fail-if-no-match build',
        dependsOn: ['repo:trpc:generate'],
      },
      'repo:test': {
        command: 'vp test',
        dependsOn: ['repo:trpc:generate', 'repo:frontend:generate'],
      },
      'repo:test:frontend': {
        command: 'vp test --project frontend',
        dependsOn: ['repo:trpc:generate', 'repo:frontend:generate'],
      },
      'repo:test:backend': {
        command: 'vp test --project backend',
        dependsOn: ['repo:trpc:generate'],
      },
      'repo:test:backend:e2e': {
        command: 'vp test --project backend test/app.e2e-spec.ts',
        dependsOn: ['repo:trpc:generate'],
      },
      'repo:check': {
        command: 'vp check',
        dependsOn: ['repo:trpc:generate', 'repo:frontend:generate'],
      },
      'repo:check:frontend': {
        command: 'vp check apps/frontend packages/schemas',
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
      'repo:check:fix:frontend': {
        command: 'vp check --fix apps/frontend packages/schemas',
        dependsOn: ['repo:trpc:generate', 'repo:frontend:generate'],
        cache: false,
      },
      'repo:check:fix:backend': {
        command: 'vp check --fix apps/backend packages/schemas',
        dependsOn: ['repo:trpc:generate'],
        cache: false,
      },
      'repo:lint': {
        command: 'vp lint',
        dependsOn: ['repo:trpc:generate', 'repo:frontend:generate'],
      },
      'repo:lint:frontend': {
        command: 'vp lint apps/frontend packages/schemas',
        dependsOn: ['repo:trpc:generate', 'repo:frontend:generate'],
      },
      'repo:lint:backend': {
        command: 'vp lint apps/backend packages/schemas',
        dependsOn: ['repo:trpc:generate'],
      },
      'repo:staged': {
        command: 'vp staged',
        dependsOn: ['repo:trpc:generate', 'repo:frontend:generate'],
        cache: false,
      },
      'repo:trpc:watch': {
        command:
          'vp exec --filter @repo/backend nestjs-trpc watch --entrypoint src/app.module.ts --output ../../packages/schemas/src/@generated',
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
