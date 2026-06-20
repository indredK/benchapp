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
  let config = configs[resolveEnv()];

  // 运行时环境变量覆盖（编译时注入，不会进生产包）
  if (typeof process !== 'undefined' && process.env) {
    if (process.env.API_BASE_URL) {
      config = { ...config, baseURL: process.env.API_BASE_URL };
    }
    // EXPO_PUBLIC_* 是 Expo 的编译时常量注入方式
    if (process.env.EXPO_PUBLIC_ENABLE_MOCK === 'false') {
      config = { ...config, enableMock: false };
    }
  }

  cachedConfig = config;
  return cachedConfig;
}
