// ============================================================
// MiniApp — Storage Adapter (Taro-based)
// ============================================================

import type { StorageAdapter } from '@repo/types';
import Taro from '@tarojs/taro';

export const miniappStorage: StorageAdapter = {
  async getItem(key: string): Promise<string | null> {
    try {
      const res = await Taro.getStorage({ key });
      return res.data ?? null;
    } catch {
      return null;
    }
  },

  async setItem(key: string, value: string): Promise<void> {
    await Taro.setStorage({ key, data: value });
  },

  async removeItem(key: string): Promise<void> {
    await Taro.removeStorage({ key });
  },
};
