import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { devPorts } from '../vite-env-ports';

const ports = devPorts(path.resolve(__dirname, '..'));

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@shared': path.resolve(__dirname, '../shared'),
    },
  },
  server: {
    host: '0.0.0.0',
    port: ports.management,
    open: true,
    fs: {
      strict: false,
    },
    proxy: {
      '/api': {
        target: `http://127.0.0.1:${ports.api}`,
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
  },
  root: '.',
  publicDir: 'public',
});
