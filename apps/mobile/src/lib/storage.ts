// ============================================================
// Mobile — Storage Adapter (AsyncStorage-based)
// ============================================================

import type { StorageAdapter } from '@repo/types';

// Expo/RN apps should install @react-native-async-storage/async-storage
// For now, use a simple in-memory fallback
const memoryStore = new Map<string, string>();

export const mobileStorage: StorageAdapter = {
  async getItem(key: string): Promise<string | null> {
    return memoryStore.get(key) ?? null;
  },

  async setItem(key: string, value: string): Promise<void> {
    memoryStore.set(key, value);
  },

  async removeItem(key: string): Promise<void> {
    memoryStore.delete(key);
  },
};

// TODO: Replace with AsyncStorage when available:
// import AsyncStorage from '@react-native-async-storage/async-storage';
// export const mobileStorage: StorageAdapter = AsyncStorage;
