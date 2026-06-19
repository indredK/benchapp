// ============================================================
// Utility functions — pure, platform-agnostic
// ============================================================

/** Debounce a function call */
export function debounce<T extends (...args: never[]) => void>(fn: T, delayMs: number): T {
  let timer: ReturnType<typeof setTimeout>;
  return ((...args: never[]) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delayMs);
  }) as T;
}

/** Throttle a function call */
export function throttle<T extends (...args: never[]) => void>(fn: T, intervalMs: number): T {
  let last = 0;
  return ((...args: never[]) => {
    const now = Date.now();
    if (now - last >= intervalMs) {
      last = now;
      fn(...args);
    }
  }) as T;
}

/** Generate a unique ID */
export function uniqueId(prefix = 'id'): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`;
}

/** Safe JSON parse */
export function safeJsonParse<T>(str: string, fallback: T): T {
  try {
    return JSON.parse(str) as T;
  } catch {
    return fallback;
  }
}

/** Clamp a number between min and max */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
