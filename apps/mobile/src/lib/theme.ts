// ============================================================
// Mobile — Theme Setup
// ============================================================

import { createThemeStore } from '@repo/core/theme';
import { mobileStorage } from './storage';

export const themeStore = createThemeStore('system');

// Sync theme to storage
themeStore.subscribe(async (mode) => {
  await mobileStorage.setItem('app_theme', mode).catch(() => {});
});
