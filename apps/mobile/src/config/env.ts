// ============================================================
// Mobile — Environment Configuration
// ============================================================

import type { EnvConfig } from '@repo/types';

const configs: Record<string, EnvConfig> = {
  development: {
    env: 'development',
    baseURL: 'http://localhost:3000/api',
    logLevel: 'debug',
    enableMock: true,
  },
  test: {
    env: 'test',
    baseURL: 'https://test-api.example.com',
    logLevel: 'info',
    enableMock: false,
  },
  production: {
    env: 'production',
    baseURL: 'https://api.example.com',
    logLevel: 'warn',
    enableMock: false,
  },
};

function resolveEnv(): 'development' | 'test' | 'production' {
  // Expo 环境判断
  if (typeof process !== 'undefined' && process.env?.NODE_ENV) {
    if (process.env.NODE_ENV === 'production') return 'production';
    if (process.env.NODE_ENV === 'test') return 'test';
  }
  return 'development';
}

let cachedConfig: EnvConfig | null = null;

export function getEnvConfig(): EnvConfig {
  if (cachedConfig) return cachedConfig;
  cachedConfig = configs[resolveEnv()];
  return cachedConfig;
}
