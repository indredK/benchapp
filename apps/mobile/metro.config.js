// ============================================================
// Metro config (Expo SDK 56)
//
// 显式解析 @repo/api-mocks：
//   开发 → 真实源码（mock 可用）
//   生产 → 空 stub（mock 不进包）
//
// 改动 config 后需清缓存：npx expo start --clear
// ============================================================

const { getDefaultConfig } = require('expo/metro-config');
const path = require('node:path');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

const isProd = process.env.NODE_ENV === 'production';
const API_MOCKS_SRC = path.resolve(__dirname, '../../packages/api-mocks/src/index.ts');
const API_MOCKS_STUB = path.resolve(__dirname, '../../packages/api-mocks/src/stub.ts');

const defaultResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === '@repo/api-mocks') {
    return { type: 'sourceFile', filePath: isProd ? API_MOCKS_STUB : API_MOCKS_SRC };
  }
  const resolver = defaultResolveRequest || context.resolveRequest;
  return resolver(context, moduleName, platform);
};

module.exports = config;
