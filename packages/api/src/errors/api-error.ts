// ============================================================
// AppError — 统一的错误模型
// ============================================================

import type { BizErrorCode } from '@repo/types/api';

export class AppError extends Error {
  public readonly code: BizErrorCode;
  public readonly httpStatus?: number;
  public readonly requestId?: string;
  public readonly data?: unknown;

  constructor(
    message: string,
    code: BizErrorCode = 10000 as BizErrorCode,
    options?: { httpStatus?: number; requestId?: string; data?: unknown },
  ) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.httpStatus = options?.httpStatus;
    this.requestId = options?.requestId;
    this.data = options?.data;
  }

  get isUnauthorized(): boolean {
    return this.code === 10002 || this.httpStatus === 401;
  }

  get isNetworkError(): boolean {
    return this.httpStatus === undefined || this.httpStatus === 0;
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      httpStatus: this.httpStatus,
      requestId: this.requestId,
    };
  }
}

/** Normalize any thrown value to AppError */
export function normalizeError(error: unknown): AppError {
  if (error instanceof AppError) return error;

  if (error instanceof Error) {
    // Check if it's a fetch/network error
    const msg = error.message.toLowerCase();
    if (msg.includes('network') || msg.includes('timeout') || msg.includes('abort')) {
      return new AppError(error.message, 10006 as BizErrorCode);
    }
    return new AppError(error.message, 10000 as BizErrorCode);
  }

  return new AppError(typeof error === 'string' ? error : 'Unknown error', 10000 as BizErrorCode);
}
