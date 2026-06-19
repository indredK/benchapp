// ============================================================
// API contract types — shared request/response DTOs
// ============================================================

import type { PaginatedResponse, PaginationParams } from './common';

// --- HTTP ---

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface RequestOptions {
  url: string;
  method?: HttpMethod;
  query?: Record<string, string | number | boolean | undefined>;
  headers?: Record<string, string>;
  body?: unknown;
  timeoutMs?: number;
  withAuth?: boolean;
  signal?: AbortSignal;
}

export interface HttpAdapter {
  request<T>(options: RequestOptions): Promise<T>;
}

// --- Auth ---

export interface TokenProvider {
  getAccessToken(): Promise<string | null>;
  clearAccessToken(): Promise<void>;
}

export interface AuthState {
  isAuthenticated: boolean;
  token: string | null;
  refreshToken: string | null;
}

// --- User contracts ---

export interface UserProfileDTO {
  id: string;
  nickname: string;
  avatar: string;
  email?: string;
  phone?: string;
  createdAt: string;
}

export interface LoginRequest {
  phone?: string;
  code?: string;
  password?: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: UserProfileDTO;
}

// --- Pagination ---

export interface GetUserListParams extends PaginationParams {
  keyword?: string;
}

export type GetUserListResponse = PaginatedResponse<UserProfileDTO>;

// --- Common error codes ---

export enum BizErrorCode {
  OK = 0,
  UNKNOWN = 10000,
  PARAM_INVALID = 10001,
  UNAUTHORIZED = 10002,
  FORBIDDEN = 10003,
  NOT_FOUND = 10004,
  RATE_LIMITED = 10005,
  INTERNAL_ERROR = 10006,
  SERVICE_UNAVAILABLE = 10007,
  TOKEN_EXPIRED = 10008,
  TOKEN_INVALID = 10009,
}
