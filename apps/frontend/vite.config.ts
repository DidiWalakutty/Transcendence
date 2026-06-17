import { defineConfig } from 'vite';
import { devtools } from '@tanstack/devtools-vite';
import { paraglideVitePlugin } from '@inlang/paraglide-js';

import { tanstackStart } from '@tanstack/react-start/plugin/vite';

import viteReact from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { nitro } from 'nitro/vite';
import { VitePWA } from 'vite-plugin-pwa';

const config = defineConfig({
  resolve: { tsconfigPaths: true },
  plugins: [
    devtools(),
    paraglideVitePlugin({
      project: './project.inlang',
      outdir: './src/@generated/paraglide',
      strategy: ['url', 'baseLocale'],
    }),
    nitro(),
    VitePWA({
      registerType: 'autoUpdate',
      outDir: '.output/public',
      includeAssets: ['favicon.ico', 'robots.txt'],
      manifestFilename: 'manifest.json',
      manifest: {
        name: 'ft_transcendence',
        short_name: 'Transcendence',
        description: 'Full-stack event management platform.',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        background_color: '#e7f3ec',
        theme_color: '#173a40',
        icons: [
          {
            src: '/logo192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/logo512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: '/logo512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },
      workbox: {
        navigateFallbackDenylist: [/^\/api\//],
      },
      devOptions: {
        enabled: true,
        suppressWarnings: true,
        type: 'module',
      },
    }),
    tailwindcss(),
    tanstackStart(),
    viteReact(),
  ],
});

export default config;
