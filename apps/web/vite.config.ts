import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@repo/core': path.resolve(__dirname, '../../packages/core/src'),
      '@repo/features': path.resolve(__dirname, '../../packages/features/src'),
      '@repo/api': path.resolve(__dirname, '../../packages/api/src'),
      '@repo/types': path.resolve(__dirname, '../../packages/types/src'),
    },
  },
});
