import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  define: {
    global: 'globalThis',
    'process.env': {},
    'process.platform': '"browser"',
    'process.version': '"v18.0.0"',
  },
  optimizeDeps: {
    include: ['@tagadapay/plugin-sdk'],
  },
});