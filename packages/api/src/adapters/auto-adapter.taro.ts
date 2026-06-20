// ============================================================
// AutoAdapter (Taro) — 根据环境自动选择 mock 或 Taro.request
//
// 与 auto-adapter.ts 同理：mock adapter 由 app 层通过 mockAdapterFactory
// 注入，@repo/api 自身不依赖任何 mock 代码。
// ============================================================

import type { HttpAdapter } from '@repo/types/api';
import { createTaroRequestAdapter } from './taro-request-adapter';
import type { MockAdapterFactory } from './auto-adapter';

export interface AutoTaroOptions {
  baseURL?: string;
  enableMock?: boolean;
  /** 模拟错误概率 0-1，默认 0.03 */
  errorRate?: number;
  /** mock adapter 工厂；不传则即使 enableMock=true 也回退到真实请求 */
  mockAdapterFactory?: MockAdapterFactory;
}

/** 小程序专用：根据 enableMock 自动返回 Taro 或注入的 Mock adapter */
export function createAutoTaroAdapter(options: AutoTaroOptions = {}): HttpAdapter {
  if (options.enableMock && options.mockAdapterFactory) {
    return options.mockAdapterFactory({ errorRate: options.errorRate ?? 0.03 });
  }
  return createTaroRequestAdapter({ baseURL: options.baseURL });
}
