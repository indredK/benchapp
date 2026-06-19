// ============================================================
// MiniApp — i18n hook
// ============================================================

import { useState, useCallback, useMemo, useEffect } from 'react';
import { createTranslate } from '@repo/core/i18n';
import type { Locale } from '@repo/types/i18n';
import Taro from '@tarojs/taro';

const STORAGE_KEY = 'app_locale';

let globalLocale: Locale = 'zh-CN';
let globalT = createTranslate(globalLocale);
const listeners = new Set<(locale: Locale) => void>();

function notifyAll(locale: Locale) {
  listeners.forEach((fn) => fn(locale));
}

export function useI18n() {
  const [locale, setLocaleState] = useState<Locale>(globalLocale);

  useEffect(() => {
    // Hydrate from storage
    Taro.getStorage({ key: STORAGE_KEY })
      .then((res) => {
        const saved = res.data;
        if (saved === 'zh-CN' || saved === 'en-US') {
          globalLocale = saved;
          globalT = createTranslate(globalLocale);
          notifyAll(globalLocale);
          setLocaleState(globalLocale);
        }
      })
      .catch(() => {});

    const listener = (l: Locale) => setLocaleState(l);
    listeners.add(listener);
    return () => { listeners.delete(listener); };
  }, []);

  const setLocale = useCallback((next: Locale) => {
    globalLocale = next;
    globalT = createTranslate(next);
    Taro.setStorage({ key: STORAGE_KEY, data: next }).catch(() => {});
    notifyAll(next);
    setLocaleState(next);
  }, []);

  const t = useMemo(() => globalT, [locale]);

  return { locale, setLocale, t };
}
