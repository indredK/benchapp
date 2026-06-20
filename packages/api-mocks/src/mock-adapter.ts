// ============================================================
// MockHttpAdapter — 实现 HttpAdapter，仅用于本地开发 / 测试
// 生产构建中本文件所在的包会被 alias 成 ./stub，不会被打包
// ============================================================

import type { HttpAdapter, HttpMethod, RequestOptions } from '@repo/types/api';
import { BizErrorCode } from '@repo/types/api';
import { AppError } from '@repo/api/errors';
import { mockHandlers } from './handlers';

/** 传给 handler 的请求上下文 */
export interface MockContext {
  /** 路径参数，如 /api/users/:id → { id: '123' } */
  params: Record<string, string>;
  /** 查询参数（URL search + RequestOptions.query 合并） */
  query: Record<string, string>;
  /** 请求体 */
  body: unknown;
}

export interface MockHandler<T = unknown> {
  method: HttpMethod;
  /** 匹配 URL，支持 :param 占位符 如 /api/users/:id */
  pattern: string;
  /** 响应数据或工厂函数 */
  response: T | ((ctx: MockContext) => T | Promise<T>);
  /** 模拟 HTTP 状态码，默认 200 */
  statusCode?: number;
}

export interface MockConfig {
  /** 全局延迟范围 [min, max] ms，默认 [200, 400] */
  delayRange?: [number, number];
  /** 模拟错误概率 0-1，默认 0 */
  errorRate?: number;
}

/** 匹配 URL pattern 如 /api/users/:id → { id: '123' } */
function matchPattern(pattern: string, path: string): Record<string, string> | null {
  const patternParts = pattern.replace(/^\//, '').split('/');
  const urlParts = path.replace(/^\//, '').split('/');

  if (patternParts.length !== urlParts.length) return null;

  const params: Record<string, string> = {};
  for (let i = 0; i < patternParts.length; i++) {
    if (patternParts[i].startsWith(':')) {
      params[patternParts[i].slice(1)] = urlParts[i];
    } else if (patternParts[i] !== urlParts[i]) {
      return null;
    }
  }
  return params;
}

/** 解析 query string，避免依赖 URLSearchParams（小程序运行时可能缺失） */
function parseQuery(search: string | undefined): Record<string, string> {
  const out: Record<string, string> = {};
  if (!search) return out;
  for (const pair of search.split('&')) {
    if (!pair) continue;
    const [rawKey, rawValue = ''] = pair.split('=');
    if (!rawKey) continue;
    out[decodeURIComponent(rawKey)] = decodeURIComponent(rawValue);
  }
  return out;
}

function randomDelay(range: [number, number]): number {
  return range[0] + Math.random() * (range[1] - range[0]);
}

/**
 * 创建 Mock adapter。handler 列表已内置（mockHandlers），
 * 调用方只需可选地传入延迟 / 错误率配置。
 */
export function createMockAdapter(config?: MockConfig): HttpAdapter {
  const delayRange: [number, number] = config?.delayRange ?? [200, 400];
  const errorRate = config?.errorRate ?? 0;

  async function resolveResponse(handler: MockHandler, ctx: MockContext) {
    if (typeof handler.response === 'function') {
      return (handler.response as (c: MockContext) => unknown)(ctx);
    }
    return handler.response;
  }

  return {
    async request<T>(options: RequestOptions): Promise<T> {
      const [path, search] = options.url.split('?');
      const method = (options.method ?? 'GET') as HttpMethod;

      // 合并 URL query 与 RequestOptions.query
      const query = parseQuery(search);
      if (options.query) {
        for (const [k, v] of Object.entries(options.query)) {
          if (v !== undefined && v !== null) query[k] = String(v);
        }
      }

      // 模拟网络延迟
      await new Promise((r) => setTimeout(r, randomDelay(delayRange)));

      // 模拟随机错误
      if (errorRate > 0 && Math.random() < errorRate) {
        throw new AppError('Simulated server error', BizErrorCode.INTERNAL_ERROR);
      }

      for (const handler of mockHandlers) {
        if (handler.method !== method) continue;
        const params = matchPattern(handler.pattern, path);
        if (!params) continue;

        const data = await resolveResponse(handler, { params, query, body: options.body });

        if (handler.statusCode && handler.statusCode >= 400) {
          throw new AppError(`Mock error for ${method} ${path}`, BizErrorCode.UNKNOWN, {
            httpStatus: handler.statusCode,
            data,
          });
        }

        return data as T;
      }

      throw new AppError(`No mock handler for ${method} ${path}`, BizErrorCode.NOT_FOUND);
    },
  };
}
