import { createApiClient, createAutoFetchAdapter } from '@repo/api';
// 仅 dev 用；生产构建会把 @repo/api-mocks alias 成空 stub，mock 数据不会进产物
import { createMockAdapter } from '@repo/api-mocks';

const enableMock = import.meta.env.VITE_ENABLE_MOCK === 'true';
const baseURL = import.meta.env.VITE_API_BASE_URL ?? '/api';

export const apiClient = createApiClient({
  adapter: createAutoFetchAdapter({ baseURL, enableMock, mockAdapterFactory: createMockAdapter }),
  defaultTimeoutMs: 15000,
});
