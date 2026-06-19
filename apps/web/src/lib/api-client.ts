import { createApiClient, createFetchAdapter } from '@repo/api';

const baseURL = import.meta.env.VITE_API_BASE_URL ?? '/api';

export const apiClient = createApiClient({
  adapter: createFetchAdapter({ baseURL }),
  defaultTimeoutMs: 15000,
});
