// ============================================================
// MiniApp — Storage Adapter (Taro-based)
// ============================================================

import type { StorageAdapter } from '@repo/types';

// Taro storage adapter — import Taro at usage time
let TaroModule: typeof import('@tarojs/taro') | null = null;

async function getTaro() {
  if (!TaroModule) {
    TaroModule = await import('@tarojs/taro');
  }
  return TaroModule;
}

export const miniappStorage: StorageAdapter = {
  async getItem(key: string): Promise<string | null> {
    const Taro = await getTaro();
    try {
      const res = await (Taro as any).getStorage({ key });
      return res.data ?? null;
    } catch {
      return null;
    }
  },

  async setItem(key: string, value: string): Promise<void> {
    const Taro = await getTaro();
    await (Taro as any).setStorage({ key, data: value });
  },

  async removeItem(key: string): Promise<void> {
    const Taro = await getTaro();
    await (Taro as any).removeStorage({ key });
  },
};
