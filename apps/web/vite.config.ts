import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

// 生产构建把 @repo/api-mocks 整体指向空 stub，确保 mock 数据不进产物；
// 开发构建指向真实源码目录。
export default defineConfig(({ mode }) => {
  const isProd = mode === 'production';
  const apiMocks = isProd
    ? path.resolve(__dirname, '../../packages/api-mocks/src/stub.ts')
    : path.resolve(__dirname, '../../packages/api-mocks/src');

  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
        '@repo/core': path.resolve(__dirname, '../../packages/core/src'),
        '@repo/features': path.resolve(__dirname, '../../packages/features/src'),
        '@repo/api': path.resolve(__dirname, '../../packages/api/src'),
        '@repo/api-mocks': apiMocks,
        '@repo/types': path.resolve(__dirname, '../../packages/types/src'),
      },
    },
  };
});
