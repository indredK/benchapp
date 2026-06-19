// ============================================================
// ApiClient — 基于 HttpAdapter 的高层请求客户端
// ============================================================

import type { HttpAdapter, RequestOptions, TokenProvider } from '@repo/types/api';
import { AppError } from '../errors/api-error';

export interface ApiClientConfig {
  adapter: HttpAdapter;
  tokenProvider?: TokenProvider;
  defaultTimeoutMs?: number;
}

export class ApiClient {
  private adapter: HttpAdapter;
  private tokenProvider?: TokenProvider;
  private defaultTimeoutMs: number;
  private refreshPromise: Promise<string | null> | null = null;

  constructor(config: ApiClientConfig) {
    this.adapter = config.adapter;
    this.tokenProvider = config.tokenProvider;
    this.defaultTimeoutMs = config.defaultTimeoutMs ?? 15000;
  }

  /** Set token provider after construction */
  setTokenProvider(provider: TokenProvider): void {
    this.tokenProvider = provider;
  }

  /** Build final headers: merge user headers + auth header */
  private async buildHeaders(
    options: Pick<RequestOptions, 'headers' | 'withAuth' | 'idempotencyKey' | 'meta'>,
  ): Promise<Record<string, string>> {
    const { headers: userHeaders, withAuth = true, idempotencyKey, meta } = options;
    const headers: Record<string, string> = { ...userHeaders };

    if (idempotencyKey) {
      headers['Idempotency-Key'] = idempotencyKey;
    }

    if (meta?.platform) {
      headers['X-Client-Platform'] = meta.platform;
    }

    if (meta?.requestId) {
      headers['X-Request-Id'] = meta.requestId;
    }

    if (withAuth && this.tokenProvider) {
      const token = await this.tokenProvider.getAccessToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    return headers;
  }

  private async refreshAccessTokenSingleFlight(): Promise<string | null> {
    if (!this.tokenProvider?.refreshAccessToken) return null;

    if (!this.refreshPromise) {
      this.refreshPromise = this.tokenProvider.refreshAccessToken()
        .catch(async (error) => {
          await this.tokenProvider?.clearAccessToken();
          throw error;
        })
        .finally(() => {
          this.refreshPromise = null;
        });
    }

    return this.refreshPromise;
  }

  private async requestInternal<T>(options: RequestOptions, isRetry: boolean): Promise<T> {
    const headers = await this.buildHeaders(options);

    try {
      return await this.adapter.request<T>({
        ...options,
        headers,
        timeoutMs: options.timeoutMs ?? this.defaultTimeoutMs,
      });
    } catch (error) {
      if (
        error instanceof AppError &&
        error.isUnauthorized &&
        options.withAuth !== false &&
        options.retryOnUnauthorized !== false &&
        !isRetry
      ) {
        const nextToken = await this.refreshAccessTokenSingleFlight();
        if (nextToken) {
          return this.requestInternal<T>(options, true);
        }
      }

      if (error instanceof AppError && error.isUnauthorized && this.tokenProvider) {
        await this.tokenProvider.clearAccessToken();
      }
      throw error;
    }
  }

  async request<T>(options: RequestOptions): Promise<T> {
    return this.requestInternal<T>(options, false);
  }

  // Convenience methods
  async get<T>(url: string, options?: Omit<RequestOptions, 'url' | 'method'>): Promise<T> {
    return this.request<T>({ ...options, url, method: 'GET' });
  }

  async post<T>(url: string, body?: unknown, options?: Omit<RequestOptions, 'url' | 'method' | 'body'>): Promise<T> {
    return this.request<T>({ ...options, url, method: 'POST', body });
  }

  async put<T>(url: string, body?: unknown, options?: Omit<RequestOptions, 'url' | 'method' | 'body'>): Promise<T> {
    return this.request<T>({ ...options, url, method: 'PUT', body });
  }

  async patch<T>(url: string, body?: unknown, options?: Omit<RequestOptions, 'url' | 'method' | 'body'>): Promise<T> {
    return this.request<T>({ ...options, url, method: 'PATCH', body });
  }

  async delete<T>(url: string, options?: Omit<RequestOptions, 'url' | 'method'>): Promise<T> {
    return this.request<T>({ ...options, url, method: 'DELETE' });
  }
}

/** Create an ApiClient instance */
export function createApiClient(config: ApiClientConfig): ApiClient {
  return new ApiClient(config);
}
