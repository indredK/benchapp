// ============================================================
// Common types shared across all three ends
// ============================================================

/** API 统一返回结构 */
export interface ApiResponse<T = unknown> {
  code: number;
  data: T;
  message: string;
  requestId?: string;
  timestamp?: number;
}

/** 分页请求参数 */
export interface PaginationParams {
  page: number;
  pageSize: number;
}

/** 分页响应 */
export interface PaginatedResponse<T> {
  list: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

/** 排序方向 */
export type SortOrder = 'asc' | 'desc';

/** 通用排序参数 */
export interface SortParams {
  sortBy?: string;
  sortOrder?: SortOrder;
}

/** 列表查询参数 */
export type ListQuery = PaginationParams & SortParams;

/** 环境标识 */
export type Env = 'development' | 'test' | 'production';

/** 环境配置 */
export interface EnvConfig {
  env: Env;
  baseURL: string;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
  enableMock?: boolean;
}

/** Feature 开关 */
export interface FeatureFlags {
  enableDarkMode: boolean;
  enableI18n: boolean;
  enableAnalytics: boolean;
  [key: string]: boolean | undefined;
}

/** 异步状态 */
export type AsyncStatus = 'idle' | 'loading' | 'success' | 'error';

/** 异步资源 */
export interface AsyncResource<T> {
  data: T | null;
  status: AsyncStatus;
  error: Error | null;
}

/** 存储键定义 */
export type StorageKey = string;

/** Client surface identifier */
export type ClientPlatform = 'web' | 'miniapp' | 'mobile';

/** Common mutation metadata for tracing / idempotency */
export interface MutationMeta {
  requestId: string;
  platform: ClientPlatform;
}

/** Entities protected by optimistic concurrency */
export interface VersionedEntity {
  id: string;
  version: number | string;
  updatedAt?: string;
}

export interface FeedbackToastOptions {
  kind?: 'success' | 'error' | 'info';
}

export interface FeedbackConfirmOptions {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  destructive?: boolean;
}

/** Cross-platform user feedback port */
export interface FeedbackPort {
  toast(message: string, options?: FeedbackToastOptions): void | Promise<void>;
  confirm(options: FeedbackConfirmOptions): Promise<boolean>;
  error(error: unknown, fallbackMessage?: string): void | Promise<void>;
}

/** 用户信息基础字段 */
export interface UserInfo {
  id: string;
  nickname: string;
  avatar?: string;
  phone?: string;
}

/** 存储适配器接口 */
export interface StorageAdapter {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
}

/** Cache entry with TTL */
export interface CacheEntry<T> {
  data: T;
  expiresAt: number | null; // null = never expires
}
