// ============================================================
// MiniApp — API Client Setup
// ============================================================

import { createTaroRequestAdapter, createApiClient, createTokenProvider, setTaroInstance } from '@repo/api';
import { miniappStorage } from './storage';
import type { Env } from '@repo/types';

const apiConfig: Record<Env, string> = {
  development: 'http://localhost:3000/api',
  test: 'https://test-api.example.com',
  production: 'https://api.example.com',
};

const currentEnv: Env = (process.env.TARO_ENV as Env) ?? 'development';

export function initApiClient(Taro: typeof import('@tarojs/taro')) {
  setTaroInstance(Taro);

  const adapter = createTaroRequestAdapter({
    baseURL: apiConfig[currentEnv],
    defaultTimeout: 15000,
  });

  const tokenProvider = createTokenProvider(miniappStorage);

  return createApiClient({ adapter, tokenProvider });
}

export { currentEnv, apiConfig };
