// ============================================================
// MiniApp — i18n Setup
// ============================================================

import { createAtomStore } from '@repo/core/store';
import type { Locale } from '@repo/types/i18n';

const localeAtom = createAtomStore<Locale>('zh-CN');

export const localeStore = {
  getState: () => localeAtom.getState(),
  setState: (next: Locale) => localeAtom.setState(next),
  subscribe: localeAtom.subscribe,
};
