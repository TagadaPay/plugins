import path from 'path';

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },

  server: {
    port: 5173,
    open: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Only split the English locale (eagerly imported); other locales stay as lazy chunks
          if (id.includes('iso3166-2-db') && id.includes('/en')) return 'vendor-geodata';
          if (id.includes('react-hook-form') || id.includes('@hookform/resolvers') || id.includes('/zod/')) return 'vendor-forms';
          if (id.includes('@radix-ui/')) return 'vendor-ui';
          if (id.includes('framer-motion')) return 'vendor-motion';
          if (id.includes('@tanstack/react-query') || id.includes('/axios/')) return 'vendor-query';
        },
      },
    },
  },
});
