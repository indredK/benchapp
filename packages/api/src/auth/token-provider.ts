// ============================================================
// TokenProvider — default implementation
// ============================================================

import type { TokenProvider, StorageAdapter } from '@repo/types';

export function createTokenProvider(
  storage?: StorageAdapter,
  options?: {
    accessTokenKey?: string;
    refreshTokenKey?: string;
    refreshAccessToken?: () => Promise<string | null>;
  },
): TokenProvider {
  const accessTokenKey = options?.accessTokenKey ?? 'auth_token';
  const refreshTokenKey = options?.refreshTokenKey ?? 'refresh_token';

  return {
    async getAccessToken(): Promise<string | null> {
      if (!storage) return null;
      return storage.getItem(accessTokenKey);
    },

    async clearAccessToken(): Promise<void> {
      if (!storage) return;
      await storage.removeItem(accessTokenKey);
      await storage.removeItem(refreshTokenKey);
    },

    refreshAccessToken: options?.refreshAccessToken,
  };
}
