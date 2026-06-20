// ============================================================
// MiniApp — API Client (Taro-based, mock auto-selected by env)
// ============================================================

import Taro from '@tarojs/taro';
import { createApiClient, createAutoTaroAdapter, setTaroInstance } from '@repo/api';
// 仅 dev 用；生产构建会把 @repo/api-mocks alias 成空 stub，mock 数据不会进产物
import { createMockAdapter } from '@repo/api-mocks';
import { getEnvConfig } from '@/config/env';

setTaroInstance(Taro as any);

const config = getEnvConfig();

export const apiClient = createApiClient({
  adapter: createAutoTaroAdapter({
    baseURL: config.baseURL,
    enableMock: config.enableMock,
    mockAdapterFactory: createMockAdapter,
  }),
  defaultTimeoutMs: 15000,
});

export { createApiClient, createTaroRequestAdapter, setTaroInstance } from '@repo/api';
