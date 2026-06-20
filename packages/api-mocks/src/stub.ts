// ============================================================
// 生产构建替身（stub）
//
// 各端打包器在生产模式下把 `@repo/api-mocks` 整体 alias 到本文件，
// 从而保证 mock 数据与 handler 不会进入生产产物。
//
// 正常情况下生产环境 enableMock 恒为 false，下面的工厂不会被调用；
// 若被误调用则立即抛错，暴露配置问题而非静默返回假数据。
// ============================================================

import type { HttpAdapter } from '@repo/types/api';

export function createMockAdapter(): HttpAdapter {
  throw new Error(
    '[api-mocks] mock adapter 在生产构建中不可用（已被 stub 替换）。请检查 enableMock 配置。',
  );
}
