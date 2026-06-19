// ============================================================
// Mobile — API Client (Fetch-based)
// ============================================================

import { createApiClient, createFetchAdapter } from '@repo/api';
import { getEnvConfig } from '@/config/env';

const config = getEnvConfig();

export const apiClient = createApiClient({
  adapter: createFetchAdapter({ baseURL: config.baseURL }),
  defaultTimeoutMs: 15000,
});

// Re-export for convenience
export { createApiClient, createFetchAdapter } from '@repo/api';
