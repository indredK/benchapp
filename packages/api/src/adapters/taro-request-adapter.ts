// ============================================================
// TaroRequestAdapter — for mini programs
// ============================================================

import type { HttpAdapter, RequestOptions } from '@repo/types/api';
import { BizErrorCode } from '@repo/types/api';
import { AppError } from '../errors/api-error';

// Taro is a peer/optional dependency — type-only reference
interface TaroStatic {
  request<T>(options: {
    url: string;
    method?: string;
    data?: unknown;
    header?: Record<string, string>;
    timeout?: number;
  }): Promise<{ data: T; statusCode: number; header: Record<string, string> }>;
}

let _taro: TaroStatic | null = null;

export function setTaroInstance(taro: TaroStatic): void {
  _taro = taro;
}

function getTaro(): TaroStatic {
  if (!_taro) {
    throw new AppError(
      'Taro instance not set. Call setTaroInstance() first.',
      BizErrorCode.INTERNAL_ERROR,
    );
  }
  return _taro;
}

function buildTaroUrl(baseURL: string, url: string, query?: Record<string, string | number | boolean | undefined>): string {
  const fullUrl = `${baseURL.replace(/\/$/, '')}/${url.replace(/^\//, '')}`;
  if (!query) return fullUrl;

  const params = Object.entries(query)
    .filter(([, v]) => v !== undefined && v !== null && v !== '')
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(`${v}`)}`)
    .join('&');

  return params ? `${fullUrl}?${params}` : fullUrl;
}

function getRequestId(header: Record<string, string> | undefined, body: unknown): string | undefined {
  const fromHeader = header?.['x-request-id'] ?? header?.['X-Request-Id'];
  if (fromHeader) return fromHeader;
  if (body && typeof body === 'object' && 'requestId' in body) {
    return (body as { requestId?: string }).requestId;
  }
  return undefined;
}

export function createTaroRequestAdapter(options?: { baseURL?: string; defaultTimeout?: number }): HttpAdapter {
  const baseURL = options?.baseURL ?? '';
  const defaultTimeout = options?.defaultTimeout ?? 15000;

  return {
    async request<T>(req: RequestOptions): Promise<T> {
      const taro = getTaro();
      const url = buildTaroUrl(baseURL, req.url, req.query);
      const timeoutMs = req.timeoutMs ?? defaultTimeout;

      try {
        const result = await taro.request<{ code: number; data: T; message: string }>({
          url,
          method: req.method ?? 'GET',
          data: req.body,
          header: {
            'Content-Type': 'application/json',
            ...req.headers,
          },
          timeout: timeoutMs,
        });

        const body = result.data;
        const requestId = getRequestId(result.header, body);

        if (result.statusCode >= 400) {
          throw new AppError(
            `HTTP ${result.statusCode}`,
            result.statusCode === 401 ? BizErrorCode.UNAUTHORIZED : BizErrorCode.UNKNOWN,
            { httpStatus: result.statusCode, data: body, requestId },
          );
        }

        // Support both raw T and wrapped ApiResponse<T>
        if (body && typeof body === 'object' && 'code' in body && 'data' in body) {
          if (body.code !== 0) {
            throw new AppError(body.message ?? 'Business error', body.code as BizErrorCode, {
              data: body,
              requestId,
              httpStatus: result.statusCode,
            });
          }
          return body.data;
        }

        return body;
      } catch (error) {
        if (error instanceof AppError) throw error;

        throw new AppError(
          error instanceof Error ? error.message : 'Network error',
          BizErrorCode.INTERNAL_ERROR,
          { httpStatus: 0 },
        );
      }
    },
  };
}
