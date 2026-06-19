// ============================================================
// FetchAdapter — for Expo / Web
// ============================================================

import type { HttpAdapter, RequestOptions } from '@repo/types/api';
import { BizErrorCode } from '@repo/types/api';
import { AppError } from '../errors/api-error';

function buildUrl(baseURL: string, url: string, query?: Record<string, string | number | boolean | undefined>): string {
  const fullUrl = `${baseURL.replace(/\/$/, '')}/${url.replace(/^\//, '')}`;
  if (!query) return fullUrl;

  const params = Object.entries(query)
    .filter(([, v]) => v !== undefined && v !== null && v !== '')
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(`${v}`)}`)
    .join('&');

  return params ? `${fullUrl}?${params}` : fullUrl;
}

export function createFetchAdapter(options?: { baseURL?: string; defaultTimeout?: number }): HttpAdapter {
  const baseURL = options?.baseURL ?? '';
  const defaultTimeout = options?.defaultTimeout ?? 15000;

  return {
    async request<T>(req: RequestOptions): Promise<T> {
      const url = buildUrl(baseURL, req.url, req.query);
      const timeoutMs = req.timeoutMs ?? defaultTimeout;

      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);

      try {
        const response = await fetch(url, {
          method: req.method ?? 'GET',
          headers: {
            'Content-Type': 'application/json',
            ...req.headers,
          },
          body: req.body ? JSON.stringify(req.body) : undefined,
          signal: req.signal ?? controller.signal,
        });

        let body: unknown;
        try {
          body = await response.json();
        } catch {
          body = null;
        }

        const requestId =
          response.headers.get('x-request-id') ??
          (body && typeof body === 'object' ? (body as { requestId?: string }).requestId : undefined);

        if (!response.ok) {
          throw new AppError(
            (body as { message?: string })?.message ?? `HTTP ${response.status}`,
            response.status === 401 ? BizErrorCode.UNAUTHORIZED : BizErrorCode.UNKNOWN,
            { httpStatus: response.status, data: body, requestId },
          );
        }

        if (body && typeof body === 'object' && 'code' in body && 'data' in body) {
          const apiBody = body as { code: number; data: T; message?: string; requestId?: string };
          if (apiBody.code !== 0) {
            throw new AppError(
              apiBody.message ?? 'Business error',
              apiBody.code as BizErrorCode,
              { httpStatus: response.status, data: body, requestId: apiBody.requestId ?? requestId },
            );
          }
          return apiBody.data;
        }

        return body as T;
      } catch (error) {
        if (error instanceof AppError) throw error;

        if (error instanceof DOMException && error.name === 'AbortError') {
          throw new AppError('Request timeout', BizErrorCode.INTERNAL_ERROR);
        }

        throw new AppError(
          error instanceof Error ? error.message : 'Network error',
          BizErrorCode.INTERNAL_ERROR,
          { httpStatus: 0 },
        );
      } finally {
        clearTimeout(timer);
      }
    },
  };
}
