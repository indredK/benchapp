// ============================================================
// TokenProvider — default implementation
// ============================================================

import type { TokenProvider, StorageAdapter } from '@repo/types';

export function createTokenProvider(storage?: StorageAdapter): TokenProvider {
  return {
    async getAccessToken(): Promise<string | null> {
      if (!storage) return null;
      return storage.getItem('auth_token');
    },

    async clearAccessToken(): Promise<void> {
      if (!storage) return;
      await storage.removeItem('auth_token');
      await storage.removeItem('refresh_token');
    },
  };
}
