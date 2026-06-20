// ============================================================
// MiniApp — Environment Configuration
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
  // Taro 环境判断
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

  // Taro defineConstants 注入的编译时常量（由 config/index.ts 定义）
  // 仅在 dev 模式下被 start.mjs 覆写；生产构建时 __TARO_ENABLE_MOCK__ 默认为 false（走真实 API）
  declare const __TARO_ENABLE_MOCK__: boolean;
  declare const __TARO_API_BASE_URL__: string;

  if (typeof __TARO_ENABLE_MOCK__ !== 'undefined' && !__TARO_ENABLE_MOCK__) {
    config = { ...config, enableMock: false };
  }
  if (typeof __TARO_API_BASE_URL__ !== 'undefined' && __TARO_API_BASE_URL__) {
    config = { ...config, baseURL: __TARO_API_BASE_URL__ };
  }

  cachedConfig = config;
  return cachedConfig;
}
