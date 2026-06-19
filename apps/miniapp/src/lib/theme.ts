// ============================================================
// MiniApp — Theme Setup
// ============================================================

import { createThemeStore } from '@repo/core/theme';
import { miniappStorage } from './storage';

export const themeStore = createThemeStore('system');

// Sync theme to storage
themeStore.subscribe(async (mode) => {
  await miniappStorage.setItem('app_theme', mode).catch(() => {});
});
