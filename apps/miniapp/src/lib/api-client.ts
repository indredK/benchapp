// ============================================================
// MiniApp — API Client (Taro.request-based)
// ============================================================

import Taro from '@tarojs/taro';
import { createApiClient, createTaroRequestAdapter, setTaroInstance } from '@repo/api';
import { getEnvConfig } from '@/config/env';

// Register Taro instance for the adapter
setTaroInstance(Taro as any);

const config = getEnvConfig();

export const apiClient = createApiClient({
  adapter: createTaroRequestAdapter({ baseURL: config.baseURL }),
  defaultTimeoutMs: 15000,
});

// Re-export for convenience
export { createApiClient, createTaroRequestAdapter, setTaroInstance } from '@repo/api';
