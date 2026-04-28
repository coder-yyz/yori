import path from 'path';
import checker from 'vite-plugin-checker';
import { defineConfig } from 'vite';
import { compression } from 'vite-plugin-compression2';
import react from '@vitejs/plugin-react-swc';

// ----------------------------------------------------------------------

const PORT = 8080;

function getPackageName(id: string) {
  const normalizedId = id.replace(/\\/g, '/');
  const parts = normalizedId.split('/node_modules/');
  if (parts.length < 2) return null;

  const packagePath = parts[1];
  if (!packagePath) return null;

  if (packagePath.startsWith('@')) {
    const [scope, name] = packagePath.split('/');
    if (!scope || !name) return null;
    return `${scope}/${name}`;
  }

  const [name] = packagePath.split('/');
  return name || null;
}

function getVendorChunk(id: string) {
  if (!id.includes('node_modules')) return undefined;

  if (
    id.includes('/node_modules/react/') ||
    id.includes('/node_modules/react-dom/') ||
    id.includes('/node_modules/react-router/') ||
    id.includes('/node_modules/scheduler/')
  ) {
    return 'vendor-react';
  }

  if (id.includes('/@mui/x-')) {
    return 'vendor-mui-x';
  }

  if (
    id.includes('/@mui/') ||
    id.includes('/@emotion/') ||
    id.includes('/stylis/') ||
    id.includes('/@iconify/') ||
    id.includes('/clsx/') ||
    id.includes('/prop-types/') ||
    id.includes('/react-is/') ||
    id.includes('/react-transition-group/') ||
    id.includes('/node_modules/@popperjs/') ||
    id.includes('/node_modules/@babel/runtime/') ||
    id.includes('/hoist-non-react-statics/')
  ) {
    return 'vendor-ui';
  }

  if (id.includes('/apexcharts/') || id.includes('/react-apexcharts/')) {
    return 'vendor-chart';
  }

  if (id.includes('/lowlight/') || id.includes('/highlight.js/')) {
    return 'vendor-highlight';
  }

  if (id.includes('/@tiptap/') || id.includes('/turndown/')) {
    return 'vendor-editor';
  }

  if (
    id.includes('/react-hook-form/') ||
    id.includes('/@hookform/resolvers/') ||
    id.includes('/zod/')
  ) {
    return 'vendor-form';
  }

  if (id.includes('/i18next/') || id.includes('/react-i18next/')) {
    return 'vendor-i18n';
  }

  if (id.includes('/dayjs/') || id.includes('/axios/') || id.includes('/swr/')) {
    return 'vendor-data';
  }

  if (
    id.includes('/embla-carousel') ||
    id.includes('/yet-another-react-lightbox/') ||
    id.includes('/react-dropzone/')
  ) {
    return 'vendor-media';
  }

  if (id.includes('/minimal-shared/') || id.includes('/nprogress/')) {
    return 'vendor-core-utils';
  }

  const pkg = getPackageName(id);
  if (!pkg) return undefined;

  if (pkg === 'framer-motion') return 'vendor-motion';

  return undefined;
}

export default defineConfig({
  plugins: [
    react({
      tsDecorators: true,
    }),
    checker({
      typescript: true,
      eslint: {
        useFlatConfig: true,
        lintCommand: 'eslint "./src/**/*.{js,jsx,ts,tsx}"',
        dev: { logLevel: ['error'] },
      },
      overlay: {
        position: 'tl',
        initialIsOpen: false,
      },
    }),
    // Precompress assets at build time so nginx can serve .gz / .br sidecars
    // (no CPU cost at request time; smaller payload over slow networks).
    compression({
      algorithm: 'gzip',
      threshold: 1024,
      exclude: [/\.(br|gz)$/],
    }),
    compression({
      algorithm: 'brotliCompress',
      threshold: 1024,
      exclude: [/\.(br|gz)$/],
    }),
  ],
  resolve: {
    alias: [
      {
        find: /^src(.+)/,
        replacement: path.resolve(process.cwd(), 'src/$1'),
      },
    ],
  },
  server: {
    port: PORT,
    host: true,
    proxy: {
      '/api': 'http://localhost:2000',
      '/uploads': 'http://localhost:2000',
    },
  },
  preview: { port: PORT, host: true },
  build: {
    target: 'esnext',
    chunkSizeWarningLimit: 800,
    rollupOptions: {
      output: {
        manualChunks(id) {
          return getVendorChunk(id);
        },
      },
    },
  },
});
