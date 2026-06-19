// ============================================================
// Mobile — i18n Setup
// ============================================================

import { createAtomStore } from '@repo/core/store';
import type { Locale } from '@repo/types/i18n';

// Simple locale store using atom pattern
const localeAtom = createAtomStore<Locale>('zh-CN');

export const localeStore = {
  getState: () => localeAtom.getState(),
  setState: (next: Locale) => localeAtom.setState(next),
  subscribe: localeAtom.subscribe,
};
