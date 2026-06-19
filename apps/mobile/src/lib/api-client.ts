// ============================================================
// Mobile — API Client Setup
// ============================================================

import { createFetchAdapter, createApiClient, createTokenProvider } from '@repo/api';
import { mobileStorage } from './storage';
import type { Env } from '@repo/types';

const apiConfig: Record<Env, string> = {
  development: 'http://localhost:3000/api',
  test: 'https://test-api.example.com',
  production: 'https://api.example.com',
};

const currentEnv: Env = (process.env.EXPO_PUBLIC_ENV as Env) ?? 'development';

const adapter = createFetchAdapter({
  baseURL: apiConfig[currentEnv],
  defaultTimeout: 15000,
});

const tokenProvider = createTokenProvider(mobileStorage);

export const apiClient = createApiClient({ adapter, tokenProvider });

export { currentEnv, apiConfig };
