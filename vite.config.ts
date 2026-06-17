import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite-plus';

const backendRoot = fileURLToPath(new URL('./apps/backend', import.meta.url));
const frontendRoot = fileURLToPath(new URL('./apps/frontend', import.meta.url));

export default defineConfig({
  fmt: {
    ignorePatterns: ['**/dist/**', '**/.output/**', '**/node_modules/**', '**/routeTree.gen.ts'],
    singleQuote: true,
    semi: true,
    sortPackageJson: true,
  },
  lint: {
    ignorePatterns: ['**/dist/**', '**/.output/**', '**/node_modules/**', '**routeTree.gen.ts'],
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
