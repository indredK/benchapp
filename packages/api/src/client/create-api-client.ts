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
  private async buildHeaders(userHeaders?: Record<string, string>): Promise<Record<string, string>> {
    const headers: Record<string, string> = { ...userHeaders };

    if (this.tokenProvider) {
      const token = await this.tokenProvider.getAccessToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    return headers;
  }

  async request<T>(options: RequestOptions): Promise<T> {
    const headers = await this.buildHeaders(options.headers);

    try {
      return await this.adapter.request<T>({
        ...options,
        headers,
        timeoutMs: options.timeoutMs ?? this.defaultTimeoutMs,
      });
    } catch (error) {
      if (error instanceof AppError && error.isUnauthorized && this.tokenProvider) {
        await this.tokenProvider.clearAccessToken();
      }
      throw error;
    }
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
