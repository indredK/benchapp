import type { ClientPlatform, MutationMeta } from '@repo/types';

export interface MutationContext {
  idempotencyKey: string;
  meta: MutationMeta;
}

export function createRequestId(prefix = 'req'): string {
  const cryptoLike = (globalThis as { crypto?: { randomUUID?: () => string } }).crypto;
  const random = cryptoLike?.randomUUID?.();
  if (random) {
    return `${prefix}-${random}`;
  }

  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export function createMutationContext(platform: ClientPlatform, scope: string): MutationContext {
  const requestId = createRequestId(scope);

  return {
    idempotencyKey: `${scope}:${platform}:${requestId}`,
    meta: {
      requestId,
      platform,
    },
  };
}

export function createSingleFlightExecutor() {
  const inFlight = new Map<string, Promise<unknown>>();

  return async function run<T>(key: string, task: () => Promise<T>): Promise<T> {
    const existing = inFlight.get(key) as Promise<T> | undefined;
    if (existing) {
      return existing;
    }

    const promise = Promise.resolve()
      .then(task)
      .finally(() => {
        inFlight.delete(key);
      });

    inFlight.set(key, promise);
    return promise;
  };
}
