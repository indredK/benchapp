// ============================================================
// AutoAdapter — 根据环境自动选择 mock 或真实 adapter
//
// 设计要点：@repo/api 不依赖任何 mock 代码（避免与 @repo/api-mocks 形成
// 包循环，也保证 mock 数据不会从这里被打进生产产物）。mock adapter 由
// app 组合层（lib/api-client.ts）通过 mockAdapterFactory 注入；生产构建中
// app 会把 @repo/api-mocks alias 成空实现，注入的工厂也随之被剔除。
// ============================================================

import type { HttpAdapter } from '@repo/types/api';
import { createFetchAdapter } from './fetch-adapter';

/** 由 app 层注入的 mock adapter 工厂 */
export type MockAdapterFactory = (config?: { errorRate?: number }) => HttpAdapter;

export interface AutoFetchOptions {
  baseURL?: string;
  enableMock?: boolean;
  /** 模拟错误概率 0-1，默认 0.03 */
  errorRate?: number;
  /** mock adapter 工厂；不传则即使 enableMock=true 也回退到真实请求 */
  mockAdapterFactory?: MockAdapterFactory;
}

/** Web / Mobile 共用：根据 enableMock 自动返回 Fetch 或注入的 Mock adapter */
export function createAutoFetchAdapter(options: AutoFetchOptions = {}): HttpAdapter {
  if (options.enableMock && options.mockAdapterFactory) {
    return options.mockAdapterFactory({ errorRate: options.errorRate ?? 0.03 });
  }
  return createFetchAdapter({ baseURL: options.baseURL });
}
