// ============================================================
// Mobile — API Client (Fetch-based, mock auto-selected by env)
// ============================================================

import { createApiClient, createAutoFetchAdapter } from '@repo/api';
// 仅 dev 用；生产构建会把 @repo/api-mocks alias 成空 stub，mock 数据不会进产物
import { createMockAdapter } from '@repo/api-mocks';
import { getEnvConfig } from '@/config/env';

const config = getEnvConfig();

export const apiClient = createApiClient({
  adapter: createAutoFetchAdapter({
    baseURL: config.baseURL,
    enableMock: config.enableMock,
    mockAdapterFactory: createMockAdapter,
  }),
  defaultTimeoutMs: 15000,
});

export { createApiClient, createFetchAdapter } from '@repo/api';
